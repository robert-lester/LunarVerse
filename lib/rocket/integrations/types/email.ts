import * as AWS from 'aws-sdk';
import { BaseRocket } from '../baseRocket';
import RocketResponse from './rocketResponse';

const DEFAULT_FROM = process.env.DEFAULT_EMAIL_SENDER;
const DEFAULT_REPLY_TO = [process.env.DEFAULT_EMAIL_SENDER];
const SES = new AWS.SES({ region: 'us-east-1' });

export class EmailRocket extends BaseRocket {
  constructor(type: string, config: any) {
    super(type, config);

    this.config.to = config.to.split(',').map(str => str.trim());
    this.config.cc = config.cc ? config.cc.split(',').map(str => str.trim()) : [];
    this.config.bcc = config.bcc ? config.bcc.split(',').map(str => str.trim()) : [];
    this.config.from = config.from ? config.from : DEFAULT_FROM;
    this.config.replyTo = config.replyTo ? config.from.split(',').map(str => str.trim()) : DEFAULT_REPLY_TO;
    this.config.response = {};
  }

  /**
   * Sends email through SES and creates a response
   * @param {object} data contains the subject and body of the email
   * @returns {RocketResponse} built out response returned from SES 
   */
  async send(data: any) :Promise<RocketResponse> {
    const { config } = this;
    try {
      const res = await SES.sendEmail({
        Source: config.from,
        Destination: {
          BccAddresses: config.bcc,
          CcAddresses: config.cc,
          ToAddresses: config.to,
        },
        // ReplyToAddresses: config.replyTo,
        Message: {
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: data.body,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: data.subject,
          },
        },
      }).promise();
      this.config.response = {
        status: 200,
        raw: {
          status: 200,
          statusText: 'Ok',
          response: `Request Id: ${(res as any).ResponseMetadata.RequestId}`,
          message: `Email sent successfully`,
        },
      };
    } catch (e) {
      this.config.response = {
        status: 500,
        raw: {
          code: e.code,
          message: e.message,
        },
      };
    }

    return this.config.response;
  }
}