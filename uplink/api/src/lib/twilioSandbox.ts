import * as faker from 'faker';
import {
  ITwilioOptions,
  ITwilioPurchaseResult,
  IVoiceSandbox,
  ISmsSandbox,
} from '../@types';
import Logger from '../../../../lib/logger';
const logger = new Logger('uplink:twilio:client');

export const voiceSandbox: IVoiceSandbox = {
  say: (text: string) => text,
  dial: () => ({
    number: (number: string) => {
      logger.log(`Calling ${number}`);
    },
  }),
};

/**
 * Sandbox implementation of the Twilio client
 */
export const smsSandbox: ISmsSandbox = {
  messages: {
    create: (options: ITwilioOptions) => {
      const message = {
        body: options.body,
        to: options.to,
        from: options.from,
      };
      logger.log('Message logged: %o', message);
      return Promise.resolve(JSON.stringify(message));
    },
    media: (media: string) => ({
      remove: () => {
        logger.log('Media item removed: %o', media);
      },
    }),
  },
  availablePhoneNumbers: () => ({
    tollFree: {
      list: () => [
        { phoneNumber: `+1${faker.phone.phoneNumberFormat(0).replace(/-/g, '')}` },
        { phoneNumber: `+1${faker.phone.phoneNumberFormat(0).replace(/-/g, '')}` },
        { phoneNumber: `+1${faker.phone.phoneNumberFormat(0).replace(/-/g, '')}` },
      ],
    },
    local: {
      list: () => [
        { phoneNumber: `+1${faker.phone.phoneNumberFormat(0).replace(/-/g, '')}` },
        { phoneNumber: `+1${faker.phone.phoneNumberFormat(0).replace(/-/g, '')}` },
        { phoneNumber: `+1${faker.phone.phoneNumberFormat(0).replace(/-/g, '')}` },
      ],
    },
  }),
  incomingPhoneNumbers: {
    create: (params: ITwilioPurchaseResult): ITwilioPurchaseResult => ({
      phoneNumber: params.phoneNumber,
      sid: faker.random.uuid(),
    }),
  },
};
