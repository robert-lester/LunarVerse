import axios from 'axios';
import { google } from 'googleapis';
import { BaseRocket } from '../baseRocket';
import RocketResponse from './rocketResponse';
import setTokenResponse from './setTokenResponse';
import * as NosQL from '../../../nos-ql';

const unique = array => Array.from(new Set(array));

export class GoogleSheetsRocket extends BaseRocket {
  constructor(type: string, config: any) {
    super(type, config);

    this.config.sheetId = config.sheetId;
    this.config.scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
    ];
    this.config.oauth2Client = new (google as any).auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT,
    );
  }

  /**
   * Sends data to the Google Sheet and returns a response
   * @param {object} data contains the organization and mapped data 
   * @returns {RocketResponse} built out response returned from googleApi
   */
  async send(data: any) :Promise<RocketResponse> {
    const nosql = new NosQL();

    nosql.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');

    const orgRow = await nosql.read(data.org);

    this.config.tokens = orgRow.google_tokens;

    const tokens = await this.setToken(this.config.tokens);

    if (tokens.newTokens) {
      nosql.update(data.org, { google_tokens: tokens.tokens });
    }

    const sheets = google.sheets({ version: 'v4', auth: this.config.oauth2Client });

    const headers = Object.keys(data.map);

    try {
      let header: any = await sheets.spreadsheets.values.get({
        spreadsheetId: this.config.sheetId,
        range: 'Sheet1',
        majorDimension: 'ROWS',
      });

      if (header.data.values) {
        header = header.data.values[0];
      } else {
        header = [];
      }

      header = unique([...header, ...headers]);

      const v = [];
      header.forEach((val, index) => {
        if (data.map[val]) {
          v[index] = data.map[val];
        } else {
          v[index] = '';
        }
      });
      const values = [v];
      header = [header];

      const sHead = await sheets.spreadsheets.values.update({
        spreadsheetId: this.config.sheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        resource: { values: header },
      });

      const sBody = await sheets.spreadsheets.values.append({
        spreadsheetId: this.config.sheetId,
        valueInputOption: 'RAW',
        range: 'Sheet1!A1',
        resource: { values },
      });

      this.config.response = {
        status: 200,
        raw: {
          status: 200,
          statusText: 'Ok',
          response: 'Success',
          message: 'Row Inserted',
        },
      };
    } catch (e) {
      console.error(e.errors);
      this.config.response = {
        status: e.code,
        raw: {
          status: 500,
          statusText: 'Error',
          response: e.errors[0].reason,
          message: e.errors[0].message,
        },
      };
    }
    return this.config.response;
  }

  /**
   * Creates a new Google Sheet and returns the Id
   * @param {string} title name of the google sheet
   * @returns {string} the spreadsheet Id for new google sheet
   */
  async createSheet(title: string) {
    const sheets = google.sheets({ version: 'v4', auth: this.config.oauth2Client });
    const s = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title,
        },
      },
    });
    return s.data.spreadsheetId;
  }

  /**
   * Sets new token to the clients Google
   * @param {string} tokens new token generated from Google
   * @returns {object} new data with the new token
   */
  async setToken(tokens: any): Promise<setTokenResponse> {
    const output = {
      newTokens: false,
      tokens,
    };
    this.config.oauth2Client.setCredentials(output.tokens);
    const t = await this.config.oauth2Client.getAccessToken();
    if (t.token !== output.tokens.access_token) {
      output.tokens = t.res.data;
      output.newTokens = true;
      await this.config.oauth2Client.setCredentials(output.tokens);
    }
    return output;
  }

  /**
   * Gets the tokens from Google and returns them
   * @param {string} token initial token already existing in Google oauth
   * @returns tokens from Google
   */
  async getInitialTokens(token: string) {
    const { tokens } = await this.config.oauth2Client.getToken(token);
    return tokens;
  }

  /**
   * Generates new URL for Google auth
   * @returns OAuth URL from Google
   */
  generateOAuthUrl(org: string) {
    return decodeURIComponent(this.config.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      state: org,
    }));
  }
}