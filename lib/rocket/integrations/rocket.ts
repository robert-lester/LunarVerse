import { BaseRocket } from './baseRocket';
import { EmailRocket } from './types/email';
import { HttpRocket } from './types/http';
import { SlackRocket } from './types/slack';
import { LaunchforceRocket } from './types/launchforce';
import { GoogleSheetsRocket } from './types/googleSheets';
import RocketResponse from './types/rocketResponse';
import setTokenResponse from './types/setTokenResponse';

export default class Rocket {
  private instance: BaseRocket;

  constructor(type: string, config: any) {
    if (type === 'email') {
      this.instance = new EmailRocket(type, config);
    } else if (type === 'post') {
      this.instance = new HttpRocket(type, config);
    } else if (type === 'slack') {
      this.instance = new SlackRocket(type, config);
    } else if (type === 'salesforce') {
      this.instance = new LaunchforceRocket(type, config);
    } else if (type === 'google sheets') {
      this.instance = new GoogleSheetsRocket(type, config);
    }
  }

  async send(data: any): Promise<RocketResponse> {
    return this.instance.send(data);
  }

  generateOAuthUrl(org: string) {
    return this.instance.generateOAuthUrl(org);
  }

  async createSheet(title: string) {
    return this.instance.createSheet(title);
  }

  async setToken(token: any): Promise<setTokenResponse> {
    return this.instance.setToken(token);
  }

  async getInitialTokens(token: string) {
    return this.instance.getInitialTokens(token);
  }
}
