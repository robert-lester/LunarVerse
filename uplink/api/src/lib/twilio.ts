import * as Twilio from 'twilio';
import Logger from '../../../../lib/logger';
import { smsSandbox, voiceSandbox } from './twilioSandbox';
import {
  IKoaContext,
  TwilioTestFromSms,
  TwilioTestToSms,
  ITwilioOptions,
  IVoiceSandbox,
} from '../@types';

// When using the twilio sandbox, only the following enumerated magic numbers
// are valid to send SMS messages from. All other numbers are considered not
// sms capable.
// https://www.twilio.com/docs/iam/test-credentials#test-sms-messages-parameters-From
export enum TwilioTestFromSmsNumbers {
  InvalidPhoneNumber = '+15005550001',
  NotSmsCapable = '+15005550007',
  NotOwnedByYou = NotSmsCapable,
  SmsQueueIsFull = '+15005550008',
  PassesAllValidation = '+15005550006'
}

// When using the twilio sandbox, the following enumerated magic numbers
// produce particular errors. Any other phone number is validated normally.
// https://www.twilio.com/docs/iam/test-credentials#test-sms-messages-parameters-To
export enum TwilioTestToSmsNumbers {
  InvalidPhoneNumber = '+15005550001',
  CannotRoute = '+15005550002',
  NoInternational = '+15005550003',
  Blacklisted = '+15005550004',
  NotSmsCapable = '+15005550009',
  PassesAllValidation = '+15005550006'
}

export enum TwilioTestSmsErrorCodes {
  InvalidFromPhoneNumber = 21212,
  NotOwnedByYou = 21606,
  SmsQueueIsFull = 21611,
  InvalidToPhoneNumber = 21211,
  Blacklisted = 21610,
  CannotRoute = 21612,
  NotSmsCapable = 21614,
  NoInternational = 21408,
}

export enum TwilioTestVoiceErrorCodes {
  InvalidFromPhoneNumber = 21212,
  NotVerified = 21210,
  InvalidToPhoneNumber = 21217,
  CannotRoute = 21214,
  NoInternational = 21215,
  Blacklisted = 21216,
}

class TwilioClient {
  public client: Twilio.Twilio | any;
  public voiceResponse: IVoiceSandbox;
  private logger: Logger;

  /**
   * Creates instance of the TwilioClient
   * sets up sandbox mode if offline
   */
  constructor() {
    this.logger = new Logger('uplink:twilio:client');
    /* istanbul ignore next */
    if (process.env.TWILIO_SANDBOX === 'test') {
      this.logger.log('sandbox test mode');
      this.client = Twilio(process.env.TWILIO_TEST_SID, process.env.TWILIO_TEST_AUTH_TOKEN);
    }
    /* istanbul ignore next */
    else if (process.env.TWILIO_SANDBOX === 'stub') {
      this.logger.log('sandbox stub mode');
      this.client = smsSandbox;
      this.voiceResponse = voiceSandbox;
    }
    /* istanbul ignore next */
    else {
      this.logger.log('production mode');
      this.client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // tslint:disable-next-line
    }
  }

  //#region Public Functions

  public getVoiceResponse() {
    const VoiceResponse = require('twilio').twiml.VoiceResponse;
    return new VoiceResponse();
  }

  /**
   * Checks if the incoming request is originating from Twilio
   * @param ctx Koa request context
   * @returns boolean
   */
  public validRequest(ctx: IKoaContext): boolean {
    return Twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      ctx.request.header['x-twilio-signature'],
      // https://miro.medium.com/max/842/1*eeiN6Ap_1jck3ibwDzBm6A.jpeg
      // rewrite href because koa eats the base path
      process.env.BASE_PATH === '' ? ctx.request.href : ctx.request.href.replace('intake', `${process.env.BASE_PATH}/intake`),
      ctx.request.body,
    );
  }

  /**
   * Sends a sms message to the specified number(s)
   * @param from: Originating phone number to send from
   * @param body: Text message content
   * @param to: Array of destination phone numbers to send to
   * @return Promise containing a list twilio message data
   */
  public sendMessage(from: string | TwilioTestFromSms, body: string, ...to: (string | TwilioTestToSms)[]): Promise<any[]> {
    // If using the twilio test sandbox, use the passes all validation test 'From' number.
    if (process.env.TWILIO_SANDBOX === 'test'
        && ! Object.values(TwilioTestFromSmsNumbers).find(smsNumber => smsNumber === from)) {
        from = TwilioTestFromSmsNumbers.PassesAllValidation;
    }

    return Promise.all(
      to.map((destinationNumber: string) => {
        if (!TwilioClient.validateE164(destinationNumber)) {
          throw new Error('Incorrect phone number format');
        }
        const content: ITwilioOptions = {
          body,
          to: destinationNumber,
          from,
        };

        return this.client.messages.create(content);
      }),
    );
  }

  //#endregion
  //#region Private Functions

  /**
   * Checks if the phone number is in the correct format for Twilio
   * @param number Phone number format to test
   * @return Boolean of test result
   */
  private static validateE164(number: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(number);
  }

  //#endregion
}

export default TwilioClient;
