import * as Knex from 'knex';
import { CoreController } from './core';
import {
  IControllerIndex,
  IControllerUpdate,
} from './interfaces';
import TwilioClient from '../lib/twilio';
import { parsePhoneNumber } from '../lib/phoneParse';
import { PhoneNumber } from '../models';
import {
  IBatchCreatePhone,
  IExternalPhoneNumber,
  IAvailablePhoneOptions,
  ITwilioPurchaseResult,
  PhoneType,
} from '../@types';
import MessageSender from '../lib/messageSender';

export class PhoneNumberController extends CoreController
  implements
  IControllerIndex<PhoneNumber>,
  IControllerUpdate<PhoneNumber> {
  private applicationSid: string;
  private twilio: TwilioClient;

  constructor(connection: Knex) {
    super(connection);

    if (process.env.TWILIO_APPLICATION_SID === undefined) {
      throw new Error('no application sid set');
    }
    this.applicationSid = process.env.TWILIO_APPLICATION_SID;
    // TODO: Refactor to inject the TwilioClient as a dependency
    this.twilio = new TwilioClient();
  }

  /**
   * Retrieve all PhoneNumbers in a given organization
   * @param organization The organization the phone number belongs to
   */
  public index(organization: string): Promise<PhoneNumber[]> {
    this.connect();

    return PhoneNumber.query(this.connection)
      .where('organization_id', organization)
      .eager('[user, messages]');
  }

  /**
   * Retrieves a phone number by systemNumber column
   * @param number The phone number assigned to the record
   *
   * NOTE: This method does NOT filter based on USER or CONTACT type.
   *
   */
  public async findContactOrUserSystemNumbers(number: string): Promise<PhoneNumber[]> {
    this.connect();

    const lookUpNumber = parsePhoneNumber(number);

    return PhoneNumber.query(this.connection)
      .where('systemNumber', lookUpNumber)
      .where('organization_id', '!=', 'lunar-pool')
      .eager('[user, user.phoneNumber, messages]');
  }

  /**
   * Determine if a phone number belongs to Uplink
   * @param phoneNumber The phone number to check
   *
   * NOTE: This method does NOT filter based on USER or CONTACT type.
   *
   */
  public async isUplinkNumber(phoneNumber: string): Promise<boolean> {
    return (await this.findContactOrUserSystemNumbers(phoneNumber)).length > 0;
  }

  /**
   * Creates a new PhoneNumber record.
   * @param organization The organization the phone number belongs to
   * @param attributes The attributes to be assigned to the phone number
   */
  private create(organization: string, attributes: Partial<PhoneNumber>): Promise<PhoneNumber> {
    this.connect();
    const insert = Object.assign({}, attributes, {
      notified: false,
      organization_id: organization,
    });

    return PhoneNumber.query(this.connection)
      .insertGraphAndFetch(insert)
      .eager('[user, messages]');
  }

  /**
   * Creates the specified number of unassigned phone numbers
   * @param args Type of numbers to create, amount of numbers to create, and any Twilio purchase options
   * @return Promise containing a list of new PhoneNumbers
   */
  public async batchCreate(args: IBatchCreatePhone): Promise<PhoneNumber[]> {
    const purchaseResults = await this.purchaseNumber(args.options, args.amount);

    return Promise.all(
      purchaseResults.map((pr: ITwilioPurchaseResult) =>
        this.create(args.type === PhoneType.CONTACT ? 'lunar-pool' : args.organization_id, {
          sid: pr.sid,
          systemNumber: pr.phoneNumber,
          type: args.type,
        }),
      ),
    );
  }

  /**
   * Retrieves the least recently active Contact number in a given org's pool
   * @param organization The org pool to search in
   */
  public async getLeastActiveContactNumber(organization: string): Promise<PhoneNumber> {
    return PhoneNumber.query(this.connection)
      .findOne({ organization_id: organization, type: PhoneType.CONTACT })
      .whereNotNull('user_id') // SANITY
      .orderBy('updated_at')
      .orderBy('created_at')
      .eager('user');
  }

  /**
   * Updates an existing PhoneNumber
   * @param organization The organization the phone number belongs to
   * @param attributes The attributes to be assigned to the phone number
   * @throws Throws an Error when assigning or forwarding numbers to incorrect states
   */
  public async update(organization: string, attributes: any): Promise<PhoneNumber> {
    this.connect();
    let phoneNumber: PhoneNumber;

    let assignedFlag = false;
    let unassignedFlag = false;

    const oldPhone = await PhoneNumber.query(this.connection)
      .findById(attributes.id)
      .eager('user');

    if (oldPhone.organization_id !== organization) {
      throw new Error('You cannot update a phone number in a different org');
    }
    if ((oldPhone.user && oldPhone.user.id !== attributes.assigned_id) || oldPhone.type !== attributes.type) {
      if (attributes.type === PhoneType.UNASSIGNED) {
        unassignedFlag = true;
      }
      if (attributes.type === PhoneType.USER) {
        if (oldPhone.user){
          unassignedFlag = true;
        }
        assignedFlag = true;
      }
    }

    if (attributes.type) {
      if (attributes.type !== PhoneType.UNASSIGNED && typeof (attributes.assigned_id) === 'undefined') {
        throw new Error('You must associate a phone number with a user or forward');
      }
      switch (attributes.type) {
        case PhoneType.USER:
          attributes.user_id = attributes.assigned_id;
          attributes.forward_id = null;
          break;
        case PhoneType.FORWARD:
          attributes.forward_id = attributes.assigned_id;
          const fwd = await this.readSingle(organization, attributes.forward_id);
          if (fwd.type === PhoneType.FORWARD){
            throw new Error('You cannot forward a number to another forwarded number');
          }
          if (attributes.assigned_id === attributes.id){
            throw new Error('You cannot forward a number to itself');
          }
          attributes.user_id = null;
          break;
        case PhoneType.UNASSIGNED:
          attributes.forward_id = null;
          attributes.user_id = null;
          break;
        default:
          // TODO: Remove this once we've separated concerns between User and
          // Contact updates.
          throw new Error(`Expected to update a phone number of types ${PhoneType.USER}, ${PhoneType.FORWARD}, or ${PhoneType.UNASSIGNED}. Received ${attributes.type}`);
      }
      delete attributes.assigned_id;
    }

    if (attributes.conversations) {
      attributes.conversations = this.buildGraphConversationObject(attributes.conversations);
    }

    const res = await PhoneNumber.query(this.connection)
      .upsertGraphAndFetch(attributes, { relate: true, unrelate: true })
      .where('organization_id', organization)
      .eager('[user, messages]');

    if (Array.isArray(res)) {
      phoneNumber = res.shift();
    } else {
      phoneNumber = res;
    }

    if (!phoneNumber) {
      return null;
    }

    const sender = new MessageSender(this.connection);

    if (unassignedFlag) {
      await sender.numberUnassigned(phoneNumber);
    }
    if (assignedFlag) {
      await sender.numberAssigned(phoneNumber);
    }

    return phoneNumber;
  }

  // TODO: Replace this method with the phone number dataloader
  public async findByNumbers(organization: string, phoneNumbers: string[]): Promise<PhoneNumber[]>{
    phoneNumbers = phoneNumbers.map(parsePhoneNumber);

    return PhoneNumber.query(this.connection)
      .whereIn('systemNumber', phoneNumbers)
      .andWhere('organization_id', organization)
      .eager('[user, messages]');
  }

  public async findUserNumberByForward(organization: string, id: number): Promise<PhoneNumber> {
    const forwardId = id;
    let type = PhoneType.FORWARD;
    let p: PhoneNumber;
    let x = 0;

    while (type === PhoneType.FORWARD) {
      if (x >= 50){
        throw new Error(`Forwarding this number (Phone ID #${forwardId}) results in an infinite loop`);
      }
      p = await this.readSingle(organization, id);
      type = p.type;
      id = p.forward_id;
      x++;
    }
    return p;
  }

  /**
   * Lookup a single phoneNumber by id
   * @param organization Organization the phoneNumber belongs to
   * @param id phoneNumber id
   */
  private async readSingle(organization: string, id: number): Promise<PhoneNumber> {
    this.connect();

    return PhoneNumber.query(this.connection)
      .where('organization_id', organization)
      .findById(id)
      .eager('[user, messages]');
  }

  /**
   * Purchases an amount of phone numbers
   * @param options Optional twilio purchasing options
   * @param amount The number of phone numbers to purchase
   * @return Promise containing list of twilio purchase results
   */
  private async purchaseNumber(
    options?: IExternalPhoneNumber,
    amount = 1,
  ): Promise<ITwilioPurchaseResult[]> {
    let availableList;
    const passedOptions: IExternalPhoneNumber = options || {};
    const availableOptions: IAvailablePhoneOptions = {
      voiceEnabled: true,
      smsEnabled: true,
      mediaMessagesEnabled: true,
      contains: passedOptions.contains,
      nearLatLong: passedOptions.near_lat_long,
      inLocality: passedOptions.in_locality,
      inRegion: passedOptions.in_region,
      inLata: passedOptions.in_lata,
      inPostalCode: passedOptions.in_postal_code,
    };

    if (passedOptions.toll_free) {
      availableList = this.twilio.client.availablePhoneNumbers('US').tollFree;
    } else {
      availableList = this.twilio.client.availablePhoneNumbers('US').local;
      if (passedOptions.area_code) {
        availableOptions.areaCode = passedOptions.area_code;
      }
    }

    const available: ITwilioPurchaseResult[] = await availableList.list(availableOptions);
    if (available.length === 0) {
      throw Error('No phone numbers are available');
    }

    const amountToPurchase = available.slice(0, amount);

    return Promise.all(
      amountToPurchase.map((n: ITwilioPurchaseResult) => {
        const params = {
          phoneNumber: n.phoneNumber,
          voiceApplicationSid: this.applicationSid,
          smsApplicationSid: this.applicationSid,
        };
        return this.twilio.client.incomingPhoneNumbers.create(params);
      }),
    );
  }

  /**
   * Builds Graph insert object for the phonenumber->conversation relationship
   * @param conversations Array of conversation ids
   */
  private buildGraphConversationObject(conversations: number[]) {
    return conversations.map(c => ({
      id: c,
    }));
  }
}
