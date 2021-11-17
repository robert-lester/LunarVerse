// const jsforce = require('jsforce');
import * as jsforce from 'jsforce';
import { BaseRocket } from '../baseRocket';
import RocketResponse from './rocketResponse';

interface IConnectionWithAPEX extends jsforce.Connection {
  apex: jsforce.RestApi;
}

export class LaunchforceRocket extends BaseRocket {
  constructor(type: string, config: any) {
    super(type, config);

    this.config.username = config.username || '';
    this.config.password = config.password || '';
    this.config.token = config.token || '';
    this.config.consumerKey = config.consumerKey || '';
    this.config.consumerSecret = config.consumerSecret || '';
    this.config.sandbox = config.sandbox || false;
    this.config.authType = config.authType || 'usernamePassword';

    this.config.endpointType = config.endpointType || 'default';
    this.config.apiEndpoint = config.apiEndpoint || '';
    this.config.object = config.object || 'Lead';
  }

  login(): Promise<IConnectionWithAPEX> {
    let loginUrl = 'https://login.salesforce.com';
    let oauth2 = null;
    if (this.config.sandbox) {
      loginUrl = 'https://test.salesforce.com';
    }

    if (this.config.authType === 'oauth') {
      oauth2 = {
        loginUrl,
        clientId: this.config.consumerKey,
        clientSecret: this.config.consumerSecret,
        redirectUri: loginUrl,
      };
    }

    const salesforce = new jsforce.Connection({ loginUrl, oauth2 });

    return new Promise((resolve, reject) => {
      salesforce.login(this.config.username, (this.config.password + this.config.token), (err) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(`Logged into ${salesforce.instanceUrl}`);
          resolve(salesforce as IConnectionWithAPEX);
        }
      });
    });
  }

  async custom(entry) {
    try {
      const salesforce = await this.login();
      const response = await salesforce.apex.post(this.config.apiEndpoint, entry, undefined, undefined);
      return {
        status: 200,
        raw: {
          message: 'Data sent to Salesforce endpoint',
          response,
        },
      };
    } catch (e) {
      return {
        status: 500,
        raw: {
          message: 'There was an error inserting into Salesforce',
          response: e.toString(),
        },
      };
    }
  }

  async insert(entry) {
    try {
      const salesforce = await this.login();
      const response = await salesforce.sobject(this.config.object).create(entry);
      return {
        status: 200,
        raw: {
          message: 'Object inserted',
          response,
        },
      };
    } catch (e) {
      return {
        status: 500,
        raw: {
          message: 'There was an error inserting into Salesforce',
          response: e.toString(),
        },
      };
    }
  }

  async update(entry, id) {
    if (id) {
      entry.Id = id;
    }

    const salesforce = await this.login();
    const response = await salesforce.sobject(this.config.object).update(entry);
    return response;
  }

  async upsert(entry, externalIdFieldName) {
    const salesforce = await this.login();
    const response = await salesforce.sobject(this.config.object).upsert(entry, externalIdFieldName);
    return response;
  }

  async send(entry): Promise<RocketResponse> {
    switch(this.config.endpointType) {
      case 'custom':
        return this.custom(entry);
      case 'standard':
      default:
        return this.insert(entry);
    }
  }
}