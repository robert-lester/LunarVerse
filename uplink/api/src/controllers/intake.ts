import * as Knex from 'knex';
import Logger from '../../../../lib/logger';
import { CoreController } from './core';
import { IController } from './interfaces';

import { PhoneNumber, User } from '../models';
import MediaUtil from '../lib/media';
import { ServicesContext } from '../context';
import {
  ITwilioMessageRequest,
  MediaObject,
  MessageType,
  PhoneType,
  UserType,
  Origin,
  IntakeResponses,
  IntakeResponseMap
} from '../@types';
import MessageSender from '../lib/messageSender';
import ContactSystemNumberService from '../lib/contactSystemNumbers';
import IntakeUtils from '../intake/intakeUtils';
import Command from '../lib/command';

export class IntakeControllerResponse {
  /**
   * message:    | formatted response message for consumption by twilio   | e.g. `The message exceeds the maximum size of 1600` | Defaults to `Uplink has encountered an internal system error.`
   * rawMessage: | unformatted message intended without dynamic changes   | e.g. `The message exceeds the maximum size of `     | Defaults to `Uplink has encountered an internal system error.`
   * code:       | code directly associated with error or success message | e.g. `EXCEEDS_MAX_SIZE_MESSAGE`                     | Defaults to `DEFAULT_ERROR`
   */
  public readonly message: string;
  public readonly rawMessage: IntakeResponses;
  public readonly code: IntakeResponses;

  constructor(rawMessage: IntakeResponses, message: string = '') {
    this.rawMessage = rawMessage || IntakeResponses.INTERNAL_SYSTEM_ERROR;
    this.message = this.setMessage(message);
    this.code = IntakeResponseMap[this.rawMessage] || IntakeResponseMap[IntakeResponses.INTERNAL_SYSTEM_ERROR];
  }

  private setMessage(message): string {
    switch (this.rawMessage) {
      case IntakeResponses.EXCEEDS_MAX_SIZE_MESSAGE: {
        return `${IntakeResponses.EXCEEDS_MAX_SIZE_MESSAGE} ${MessageSender.MAX_MESSAGE_LENGTH}`;
      }
      case IntakeResponses.INTERNAL_SYSTEM_ERROR: {
        return `${IntakeResponses.INTERNAL_SYSTEM_ERROR} ${message}`;
      }
      case IntakeResponses.SUCCESS: {
        return `${IntakeResponses.SUCCESS} ${message}`;
      }
      default: {
        return this.rawMessage;
      }
    }
  }
}

export class IntakeController extends CoreController {
  private logger: Logger;

  constructor(connection: Knex, params: IController = {} as IController ) {
    super(connection, params);
    this.logger = new Logger('uplink:server:user');

    if (!params.services) {
      throw new Error('Intake controller requires a services context');
    }

    if (!params.ctx) {
      throw new Error('Intake controller requires the application context');
    }
  }

  public async sendText(message: ITwilioMessageRequest, origin: Origin = Origin.PHONE): Promise<IntakeControllerResponse> {
    // Resolve server class dependencies
    const services: ServicesContext = this.services;
    const logger: Logger = this.logger;
    const mediaUtil: MediaUtil = new MediaUtil();
    const { To, From, Body, NumMedia }: ITwilioMessageRequest = message;
    let media: MediaObject[] = [];
    const contactSystemNumberService = new ContactSystemNumberService(this.ctx);
    let isSendWebConversationDuplicates = false;

    try {
      logger.formattedLog('sms');
      const messageSender = new MessageSender(this.connection);

      if (!IntakeUtils.isValidUplinkCountryCode(To) || !IntakeUtils.isValidUplinkCountryCode(From)) {
        await messageSender.sendMessage(From, To, 'SYSTEM MSG: Message not delivered. Uplink does not yet offer services in your country.');
        return new IntakeControllerResponse(IntakeResponses.INVALID_INTERNATIONAL_NUMBER);
      }

      if (NumMedia) {
        // Pass body to util class to build and store media items and return array of urls
        media = await mediaUtil.buildMediaObjects(message);
      }

      // determine the user
      // first check the destination
      // if its a user, the sender is a contact
      // if its not a user, the sender is a user

      const destinationPhoneNumbers: PhoneNumber[] = await services.PhoneService.findContactOrUserSystemNumbers(To);
      const originatingUsers: User[] = await services.UserService.findContactOrUserByPhysicalNumber(From);

      let [userPhone] = destinationPhoneNumbers.filter(d => d.type === PhoneType.USER || d.type === PhoneType.FORWARD || d.type === PhoneType.UNASSIGNED);

      console.info('USER PHONES');
      let contactPhone: PhoneNumber;
      let organization: string;
      let user: User;
      let contact: User;
      let fromNumber: PhoneNumber;
      let toNumber: PhoneNumber;
      let messageBody = Body;

      // The message flow is mutually exclusive. Either a sender is a USER
      // sending to a CONTACT or a sender is a CONTACT sending to a USER.
      //
      // If the destination is not a USER, then the sender must be a USER.
      if (!userPhone) {
        // user -> contact
        [user] = originatingUsers.filter(d => d.type === UserType.USER);

        // The "originating user" is not a USER type.
        if (!user) {
          // The destination phone number could potentially belong to many
          // CONTACT type users in separate orgs.
          const [destinationContactPhoneNumber] = destinationPhoneNumbers.filter(d => d.type === PhoneType.CONTACT);

          // There could potentially be many originating CONTACT type users in
          // separate orgs.
          const [originatingContactUser] = originatingUsers.filter(d => d.type === UserType.CONTACT);

          if (destinationContactPhoneNumber && originatingContactUser) {
            // This message is of limited value. All we know is two phonenumbers
            // associated with some set of contacts attempted to communicate.
            // TODO: Collect metric of activity between known system numbers that
            // are not associated with USER type users
            console.error(`Possible CONTACT TO CONTACT: Contact {${originatingContactUser.id}, ${originatingContactUser.organization_id}, ${originatingContactUser.physicalNumber}} attempted to message {${destinationContactPhoneNumber.user.id}, ${destinationContactPhoneNumber.user.organization_id}, ${destinationContactPhoneNumber.user.physicalNumber}}`);
          }

          console.error('Could not find user phone');
          return new IntakeControllerResponse(IntakeResponses.CANNOT_FIND_USER);
        }

        userPhone = user.phoneNumber;
        organization = user.organization_id;
        this.ctx.organization = organization;

        if (origin === Origin.WEB) {
          isSendWebConversationDuplicates = await services.OrganizationService.isSendWebConversationDuplicates(this.ctx.organization);
        }

        [contactPhone] = destinationPhoneNumbers.filter(d => d.organization_id === organization && d.type === PhoneType.CONTACT);

        if (!contactPhone){
          await messageSender.sendMessage(From, To, 'SYSTEM MSG: Message not delivered. This number is not associated with a Contact in your Uplink organization.');
          return new IntakeControllerResponse(IntakeResponses.CANNOT_FIND_CONTACT);
        }

        contact = contactPhone.user;
        fromNumber = userPhone;
        toNumber = contactPhone;

        if (messageBody.length > MessageSender.MAX_MESSAGE_LENGTH) {
          console.error(`MAX MESSAGE LENGTH: User {${user.id}, ${user.organization_id}, ${user.physicalNumber}} attempted to message {${contact.id}, ${contact.organization_id}, ${contact.physicalNumber}}`);
          await messageSender.sendMessage(user.physicalNumber, toNumber.systemNumber, `SYSTEM MSG: Message not delivered. The message exceeds the maximum size of ${MessageSender.MAX_MESSAGE_LENGTH} characters.`);
          return new IntakeControllerResponse(IntakeResponses.EXCEEDS_MAX_SIZE_MESSAGE);
        }

        if (isSendWebConversationDuplicates) {
          // Sends a duplicate of the message to the user's physical number
          // coming from the contact's system number. The notion is to keep
          // the user's native text thread up-to-date with the conversation
          // occurring through the web interface.
          await messageSender.sendMessage(user.physicalNumber, toNumber.systemNumber, `SYSTEM MSG: (WEB) ${messageBody}`);
        }

        if (user.organization_id === 'montage-auto') {
          await messageSender.sendMessage(user.physicalNumber, toNumber.systemNumber, `SYSTEM MSG: All user numbers for Montage's Uplink Organization will cease operation as of 9/24/19. Please discontinue use of this number. Thank you.`);
        }
      }
      // If the destination is a USER, then the sender must be a CONTACT.
      else {
        // contact -> user
        organization = userPhone.organization_id;

        this.ctx.organization = organization;

        if (userPhone.type === PhoneType.FORWARD){
          userPhone = await services.PhoneService.findUserNumberByForward(organization, userPhone.id);
          messageBody = `FWD: ${messageBody}`;
        }

        user = userPhone.user;
        user.phoneNumber = userPhone;
        toNumber = userPhone;
        [contact] = originatingUsers.filter(d => d.organization_id === organization && d.type === UserType.CONTACT);
        if (!contact){
          const [secondUser] = originatingUsers.filter(d => d.organization_id === organization && d.type === UserType.USER);

          // Is a user attempting to text herself?
          // Is so, check the content of the message for an Uplink command
          if (secondUser && secondUser.phoneNumber.user_id === user.id) {
            if (await Command.execute(this.ctx, user, messageBody)) {
              return new IntakeControllerResponse(IntakeResponses.SUCCESS, 'Sent Uplink Command.');
            }
          }

          if (secondUser) {
            // TODO: Enumerate the known set of log conditions; will make it easier to find in the logs
            // TODO: Wrap console logs so that we can easily re-instrument logging or control them with environment settings
            console.error(`USER TO USER: User {${secondUser.id}, ${secondUser.organization_id}, ${secondUser.physicalNumber}} attempted to message {${user.id}, ${user.organization_id}, ${user.physicalNumber}}`);
            await messageSender.sendMessage(secondUser.physicalNumber, toNumber.systemNumber, 'SYSTEM MSG: Message not delivered. This number belongs to another User in your Uplink organization.');
            return new IntakeControllerResponse(IntakeResponses.USER_TO_USER_INVALID);
          }
          // create a contact
          console.info('need to create a contact');
          contact = await services.UserService.createContact(organization, {
            physicalNumber: From,
          });
          console.info('contact has been created');
        }
        // If the contact is unassigned, we attempt to assign a contact number.
        fromNumber = await contactSystemNumberService.resolve(contact);

        // A message being sent to an UNASSIGNED user phone number shall never
        // be sent to twilio. However, the message is stored in the database
        // and the last_communication timestamp is updated. Exploits logic in
        // the message sender.
        // TODO: Re-factor this logic into intake utils
        if (userPhone.type === PhoneType.UNASSIGNED) {
          // update phone number with last communcation
          await services.PhoneService.update(organization, {
            id: userPhone.id,
            last_communication: new Date().toISOString(),
          });
          console.error(`TO UNASSIGNED USER: Contact {${contact.id}, ${contact.organization_id}, ${contact.physicalNumber}} attempted to message unassigned user phone number {${userPhone.id}, ${userPhone.organization_id}, ${userPhone.systemNumber}}`);
          return new IntakeControllerResponse(IntakeResponses.INVALID_DESTINATION_NUMBER);
        }

        if (messageBody.length > MessageSender.MAX_MESSAGE_LENGTH) {
          console.error(`MAX MESSAGE LENGTH: Contact {${contact.id}, ${contact.organization_id}, ${contact.physicalNumber}} attempted to message {${user.id}, ${user.organization_id}, ${user.physicalNumber}}`);
          await messageSender.sendMessage(contact.physicalNumber, user.phoneNumber.systemNumber, `SYSTEM MSG: Message not delivered. The message exceeds the maximum size of ${MessageSender.MAX_MESSAGE_LENGTH} characters.`);
          return new IntakeControllerResponse(IntakeResponses.EXCEEDS_MAX_SIZE_MESSAGE);
        }
      }

      // update phone number with last communcation
      await services.PhoneService.update(organization, {
        id: toNumber.id,
        last_communication: new Date().toISOString(),
      });

      const sendResultMessage = await messageSender.send(fromNumber, toNumber, messageBody, MessageType.USER, media, null, origin);
      return new IntakeControllerResponse(IntakeResponses.SUCCESS, sendResultMessage);
    }
    catch (e) {
      console.error(`Text intake system error: ${e.message}`);
      /**
       * Only return e.message if it is in the accepted Response Map, as this can expose implementation details to consumer, including failed SQL statements
       * offering details about table information which poses a security risk.
       */
      return new IntakeControllerResponse(IntakeResponseMap[e.message] ? e.message : IntakeResponses.INTERNAL_SYSTEM_ERROR);
    }
  }
}
