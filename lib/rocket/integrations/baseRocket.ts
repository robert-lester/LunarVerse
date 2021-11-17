import * as moment from 'moment';
import RocketResponse from './types/rocketResponse';
import setTokenResponse from './types/setTokenResponse';

export abstract class BaseRocket {
  config: any;
  constructor(type: string, config: any) {
    this.config = config;
  }

  async send(data: any): Promise<RocketResponse> {
    return data;
  }

  generateOAuthUrl(org: string) {
    return '';
  }

  async createSheet(title: string) {
    return '';
  }
  
  async setToken(token: any): Promise<setTokenResponse> {
    return token;
  }

  async getInitialTokens(token: string) {
    return '';
  }
}
