import { flatten as flattenJSON } from 'flat';
import * as https from 'https';
import * as Knex from 'knex';

import IntakeUtils from './Utils';
import Rocket from '../../lib/rocket/integrations/rocket';
import { default as Airlock } from '../../lib/airlock/Airlock';
import * as RulesEngine from '../../lib/rules';
import {
  Destination,
  Pod,
  Response,
  Source,
} from '../api/models';
import { VisitController } from '../api/controllers';
import HTTPException from '../exceptions/HTTPException';
import config from '../database/knexfile';

import {
  DestinationMapping,
  MappableData,
  Mapping,
  Metadata,
  SubmissionData,
  TelescopeData,
  TelescopeIds,
} from './';

const MAX_CONTENT_LENGTH_BYTES = 64000;

export default class IntakeController {
  public constructor(private connection: Knex) {}

  /**
   * Prepare a new submission for distribution and save it to the database as a POD
   * @param apiKey The API key for the Source the submission came from
   * @param submissionData A set of key/value pairs representing the submission's fields
   * @returns The newly saved POD and the Source it came from
   */
  public async prepareSubmission(apiKey: string, submissionData: SubmissionData): Promise<any> {
    console.info('Preparing submission...');
    const metadata = this.getSubmissionMeta(submissionData);
    delete submissionData.telescope_id;
    const source = await this.getSourceByAPIKey(apiKey);
    const pod = await this.savePOD(submissionData, metadata, source);

    console.info('POD is ready for distribution');
    return {
      pod,
      source,
    };
  }

  /**
   * Distribute a POD to all Destinations in its Source's router
   * @param pod The POD to distribute
   * @param source The Source the POD came from
   */
  public async distributePOD(pod, source): Promise<void> {
    console.info('Beginning POD distribution...');
    pod.metadata.id = pod.id;
    pod.metadata.created_at = pod.created_at;
    pod.metadata.created_date = pod.created_at;

    const mapping = await this.getMapping(pod.data, pod.metadata, source.mapping);
    console.info('Retrieving Destination IDs...');
    const destinationIds = IntakeUtils.recursivelyGetDestinationIDs(source.router);
    console.info(`${destinationIds.length} Destination ID(s) found. Beginning dispatch process...`);

    await this.dispatch(pod, source, mapping, destinationIds);
    console.info('Distribution finished');
  }

  /**
   * Send an existing POD to a single Destination (that isn't necessarily in its Source's router)
   * @param organizationSlug The Organization the POD belongs to
   * @param podId The ID for the POD
   * @param destinationId The ID for the Destination to send to
   */
  public async sendPODToDestination(organizationSlug: string, podId: number, destinationId: number): Promise<void> {
    console.info('Beginning POD submission...');
    const pod = await this.getPODById(organizationSlug, podId);
    const source = await this.getSourceById(organizationSlug, pod.source_id);
    const mapping = await this.getMapping(pod.data, pod.metadata, source.mapping);

    await this.dispatch(pod, source, mapping, [destinationId]);
    console.info('Submission finished');
  }

  /**
   * Close the database connection for the controller
   */
  public closeConnection() {
    console.info('Closing connection...');
    this.connection.destroy(() => {
      console.info('Connection closed.');
    });
  }

  private async dispatch(pod: Pod, source: Source, mapping: MappableData, destinationIds: number[]): Promise<Number[]> {
    mapping.shuttle.id = pod.id;
    mapping.shuttle.created_at = pod.created_at as string;
    mapping.shuttle.created_date = pod.created_at as string;
    // This gets a unique array full of all of the Destination IDs that pass the routing rules for the passed Source using the passed mapping
    const passingDestinationIds = IntakeUtils.uniqueArray(IntakeUtils.flattenArrays(RulesEngine.test(source.router, mapping)));
    console.info(`${passingDestinationIds.length} Destinations pass Source routing`);
    // This builds a key/value array where the keys are the Destination IDs and the values are the corresponding Destinations
    // This allows us to easily determine whether a Destination with a given ID was found in the database
    const passingDestinations = (await this.getDestinationsByIds(source.organization_id, passingDestinationIds))
      .reduce((destinations, destination) => Object.assign({}, destinations, {
        [destination.id]: destination,
      }), {});
    // Here we flatten the POD data (since it might be deeply nested) and use the resulting keys to update the unmapped Source fields
    // These fields tell UI users which fields have already come in on submissions sent to that Source
    await this.updateSourceFields(source, Object.keys(flattenJSON(pod.data)));

    return Promise.all(destinationIds.map((destinationId) => {
      console.info(`Dispatching POD to Destination ${destinationId}...`);

      if (!passingDestinationIds.includes(destinationId)) {
        console.info('POD did not pass Source routing rules');
        return {
          destinationId,
          raw: {
            message: 'This POD did not pass the Source routing rules to be sent to this Destination',
          },
          status: 400,
        };
      } else if (!passingDestinations[destinationId]) {
        console.info('Destination could not be found');
        return {
          destinationId,
          raw: {
            message: 'The Destination could not be found',
          },
          status: 404,
        };
      } else if (
        Object.keys(passingDestinations[destinationId].validation).length &&
        !RulesEngine.test(passingDestinations[destinationId].validation, mapping)
      ) {
        console.info('POD did not pass Destination validation rules');
        return {
          destinationId,
          raw: {
            message: 'This POD did not pass the Source routing rules to be sent to this Destination',
          },
          status: 400,
        };
      }
      return this.sendRocket(mapping, passingDestinations[destinationId]);
    }))
      // Convert the raw objects to Response objects in the database and save them
      .then((partialResponses) => this.saveResponses(partialResponses, pod.id));
  }

  private savePOD(submissionData: SubmissionData, metadata: Metadata, source: Source): Promise<Pod> {
    console.info('Saving POD to database...');
    const data = JSON.stringify(submissionData);

    if (data.length > MAX_CONTENT_LENGTH_BYTES) {
      // 413 is the HTTP status code for request payload too large
      throw new HTTPException(`The maximum content length for POD submissions is ${MAX_CONTENT_LENGTH_BYTES} bytes after conversion to a JSON string`, 413);
    }
    const { created_at, updated_at } = metadata;

    return Pod.query(this.connection)
      .insertAndFetch({
        created_at,
        data,
        // encryption_version 2 specifies no secondary encryption
        encryption_version: 2,
        metadata: JSON.stringify(metadata),
        organization_id: source.organization_id,
        source_id: source.id,
        updated_at,
      })
      .then((pod) => {
        console.info(`POD ${pod.id} saved`);
        return Pod.decrypt(pod);
      });
  }

  private async saveResponses(partialResponses: any[], podId: number): Promise<number[]> {
    console.info('Saving Responses...');
    const now = new Date().toISOString();

    const responseIds = await this.connection('responses')
      .insert(partialResponses.map((partialResponse) => ({
        created_at: now,
        destination_id: partialResponse.destinationId,
        message: partialResponse.raw.message,
        pod_id: podId,
        raw_message: JSON.stringify(partialResponse.raw),
        status_code: partialResponse.status,
        status_id: partialResponse.status,
        updated_at: now,
      })));

    return responseIds;
  }

  private async sendRocket(mapping: MappableData, destination: Destination): Promise<any> {
    console.info('Sending POD to Destination...');
    let { config = {}, type } = destination;
    let podData;

    try {
      switch (type) {
        case 'email':
          podData = {
            // The renderString calls in this method allow us to replace values in placeholder templates with the namespaced mappable data
            body: IntakeUtils.renderString(config.body, mapping),
            subject: IntakeUtils.renderString(config.subject, mapping),
          };
          break;
        case 'google sheets':
          podData = {
            // The mapToDestination calls in this method take the Relay-normalized Source mapping and match against the outbound Destination fields using the Relay IDs as a common key
            map: this.mapToDestination(mapping, destination.mapping),
            org: destination.organization_id,
          };
          break;
        case 'post':
          podData = {
            dataType: config.dataType,
            map: this.mapToDestination(mapping, destination.mapping),
          };
          break;
        case 'salesforce':
          const map = this.mapToDestination(mapping, destination.mapping);
          const lock: Airlock = new Airlock(`alias/shuttle/airlock/${process.env.STAGE}/${destination.id}`);

          try {
            if (destination.encryption_version !== 2) {
              const plaintext = await lock.decrypt(Buffer.from(config, 'base64'));
              config = JSON.parse(plaintext);
            }
          } catch (err) {
            console.error(err.stack);
          }
          podData = Object.keys(map).reduce((sanitizedMap, key) => {
            let val: string|number = map[key];

            // Salesforce Destination submissions require additional parsing:
            // After the initial mapping, we have to replace string representations of booleans and numbers with their numeric equivalents or the Salesforce intake will throw a TypeError
            if (val === 'true') {
              val = 1;
            } else if (val === 'false') {
              val = 0;
            } else if (/^\d+$/.test(val)) {
              val = parseInt(val, 10);
            }
            return Object.assign({}, {
              [key]: val,
            }, sanitizedMap);
          }, {});
          break;
        case 'slack':
          podData = {
            channel: config.channel,
            message: IntakeUtils.renderString(config.message, mapping),
            username: config.from,
          };
          break;
        default:
          throw new Error(`Invalid destination type "${type}"`);
      }
      return new Rocket(type, config)
        .send(podData)
        .then((response) => {
          console.info('Received Response from Destination');
          return Object.assign({}, response, {
            destinationId: destination.id,
          });
        });
    } catch (err) {
      console.error(err.stack);

      return Promise.resolve({
        destinationId: destination.id,
        raw: {
          message: 'Internal server error',
        },
        status: 500,
      });
    }
  }

  private getDestinationsByIds(organizationSlug: string, ids: number[]): Promise<Destination[]> {
    console.info(`Retrieving ${ids.length} Destinations...`);
    return Destination.query(this.connection)
      .findByIds(ids)
      .where({
        archived: false,
        organization_id: organizationSlug,
      })
      .then((destinations) => {
        console.info(`${destinations.length} Destinations found`);
        destinations.forEach((destination) => {
          // This turns stringified JSON back into raw JSON values
          destination.parseJson();
        });
        return destinations;
      });
  }

  private async getMapping(submissionData: SubmissionData, metadata: Metadata, sourceMapping: Mapping): Promise<MappableData> {
    console.info('Beginning mapping process...');
    const context = {
      pod: submissionData,
      shuttle: metadata,
      telescope: await this.getTelescopeData(metadata.telescope),
    };
    console.info('Mapping complete');
    return {
      // Here we take the raw submission data and the Relay-normalized Source mapping to create a new normalized mappable dataset with submission values mapped to their corresponding Relay ID keys
      pod: Object.keys(sourceMapping).reduce((relayMapping, relayId) => Object.assign({}, relayMapping, {
        [relayId]: IntakeUtils.renderString(sourceMapping[relayId], context),
      }), {}),
      shuttle: context.shuttle,
      telescope: context.telescope,
    };
  }

  private getPODById(organizationSlug: string, id: number): Promise<Pod> {
    console.info(`Retrieving POD with ID ${id}...`);
    return Pod.query(this.connection)
      .findById(id)
      .where('organization_id', organizationSlug)
      .then((pod) => {
        if (pod instanceof Pod) {
          console.info('POD found');
          // TODO: Remove this after encryption has been fully backfilled
          // This decrypts legacy PODs so their data can be re-mapped and sent again
          return Pod.decrypt(pod);
        }
        throw new HTTPException(`POD ${id} does not exist or you do not have access to it`, 404);
      });
  }

  private getSourceByAPIKey(apiKey: string): Promise<Source> {
    console.info(`Retrieving Source with API key "${apiKey}"...`);
    // Regex for UUIDv4 format API keys
    if (!apiKey || typeof apiKey !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(apiKey)) {
      throw new HTTPException('The value for api_key is not set correctly', 400);
    }
    return Source.query(this.connection)
      .findOne({
        api_key: apiKey,
        archived: false,
      })
      .then((source) => {
        if (source instanceof Source) {
          console.info('Source found');
          // This turns stringified JSON back into raw JSON values
          source.parseJson();
          return source;
        }
        throw new HTTPException('The source referenced by api_key either does not exist or you do not have access to it', 404);
      });
  }

  private getSourceById(organizationSlug: string, id: number): Promise<Source> {
    console.info(`Retrieving Source with ID ${id}...`);
    return Source.query(this.connection)
      .findById(id)
      .where({
        archived: false,
        organization_id: organizationSlug,
      })
      .then((source) => {
        if (source instanceof Source) {
          console.info('Source found');
          // This turns stringified JSON back into raw JSON values
          source.parseJson();
          return source;
        }
        throw new HTTPException(`Source ${id} either does not exist or you do not have access to it`, 404);
      });
  }

  private getSubmissionMeta(submissionData: SubmissionData): Metadata {
    const { telescope_id = '' } = submissionData;
    // TODO: Integrate more tightly with Telescope for the tracking component by adding a database index once the Telescope DB is merged into this one
    // Metadata is always guaranteed to contain Telescope data for backwards compatibility reasons
    const telescope = telescope_id.indexOf('::') < telescope_id.lastIndexOf('::') ? {
      event_uid: telescope_id.split('::')[2],
      id: telescope_id,
      visit_uid: telescope_id.split('::')[1],
      visitor_uid: telescope_id.split('::')[0],
    } : {
      event_uid: '',
      id: telescope_id,
      visit_uid: '',
      visitor_uid: '',
    };
    const now = new Date().toISOString();

    return {
      created_at: now,
      created_date: now,
      telescope,
      updated_at: now,
    };
  }

  private getTelescopeData(ids: TelescopeIds): Promise<TelescopeData> {
    console.info('Checking for Telescope ID...');
    const defaultTelescopeData = {
      id: ids.id,
      uid: ids.visitor_uid,
      vid: ids.visit_uid,
      lid: ids.event_uid,
      referrer: '',
      user_agent: '',
      device: '',
      browser: '',
      browser_version: '',
      operating_system: '',
      ip_address: '',
      click_path: '',
      gclid: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_content: '',
      utm_term: '',
      mkwid: '',
      get_vars: {},
      events: [],
    };
    return new Promise(async (resolve) => {
      if (ids.id.indexOf('::') === ids.id.lastIndexOf('::')) {
        console.info('No valid Telescope ID found');
        resolve(defaultTelescopeData);
      } else {
        console.info('Telescope ID found. Requesting tracking data from remote Telescope service...');

        const visit = new VisitController(Knex(config));
        try {
          const telescopeResults = await visit.read(ids.visit_uid);

          resolve(Object.assign({}, defaultTelescopeData, await visit.buildVisitData(telescopeResults)) as TelescopeData);
          visit.closeConnection();
        } catch(err) {
          visit.closeConnection();
 
          if (err.statusCode === 404) {
            https.get(`${process.env.TELESCOPE_URL}/visits/${ids.visit_uid}`, (response) => {
              if (response.statusCode < 299) {
                let body = '';

                response.on('data', (chunk) => {
                  body += chunk;
                });
                response.on('end', async () => {
                  console.info('Tracking data found and attached to submission');
                  const visitData = Object.assign({}, defaultTelescopeData, await visit.buildVisitData(JSON.parse(body)));

                  resolve(visitData as TelescopeData);
                });
              } else {
                console.error(`Telescope request for visit ${ids.visit_uid} failed with status ${response.statusCode}`);
                resolve(defaultTelescopeData);
              }
            }).on('error', (err) => {
              console.error(err.stack);
              resolve(defaultTelescopeData);
            });
          } else {
            console.error(err.stack);
            resolve(defaultTelescopeData);
          }
        }
      }
    })
      // Ensure that the ID values are always consistent and every field is returned so there are no Source-side errors when trying to map missing Telescope fields
      .then((apiData) => Object.assign({}, defaultTelescopeData, apiData));
  }

  private mapToDestination(relayMapping: MappableData, destinationMapping: DestinationMapping): Mapping {
    const outboundMapping = {};

    Object.keys(destinationMapping).forEach((relayId) => {
      destinationMapping[relayId].forEach((outboundExpression) => {
        if (relayId.indexOf('telescope.') === 0 || relayId.indexOf('shuttle.') === 0) {
          outboundMapping[outboundExpression] = IntakeUtils.renderString(`{{${relayId}}}`, relayMapping);
        } else {
          outboundMapping[outboundExpression] = relayMapping.pod[relayId];
        }
      });
    });
    return outboundMapping;
  }

  private updateSourceFields(source: Source, fields: string[]): Promise<any> {
    // Update a Source's unmapped fields such that any new fields are prepended so they can be easily discovered and mapped in the UI
    const unmappedFields = fields.filter((field) => !source.fields.includes(field));

    if (unmappedFields.length) {
      console.info(`${unmappedFields.length} new fields found`);
      return Source.query(this.connection)
        .update({ fields: JSON.stringify(unmappedFields.concat(source.fields)) })
        .where('id', source.id);
    } else {
      console.info('No new fields found');
    }
    return;
  }
}
