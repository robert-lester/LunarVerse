import { Context, ServicesContext } from '../context';
import { User, PhoneNumber, Conversation } from '../models';
import { twilioSuccess } from '../lib/response';
import TwilioClient from '../lib/twilio';
import {
  DirectionType,
  IKoaContext,
  ITwilioCallRequest,
  MessageType,
  PhoneType,
  UserType,
} from '../@types';
import ContactSystemNumberService from '../lib/contactSystemNumbers';
import IntakeUtils from './intakeUtils';

/**
 * `Voice` handler
 *
 * Handles all incoming calls into system numbers
 *
 * Determines the destination number type to route the request
 * Contact/User type: find destination user and dial out to stored number
 * @param Context Koa Context object passed into Context class
 * @param Services Instance of the ServicesContext, storing all models
 */
export const voice = async (appContext: Context): Promise<any> => {
  const RequestContext: IKoaContext = appContext.Context;
  const Services: ServicesContext = appContext.Services;

  // Resolve server class dependencies
  const { CallSid, From, To }: ITwilioCallRequest = RequestContext.request.body;
  // TODO: Refactor to inject the TwilioClient as a dependency
  const twilio = new TwilioClient();
  const contactSystemNumberService = new ContactSystemNumberService(appContext);

  const twilioVoiceReponse = twilio.getVoiceResponse();

  try {
    RequestContext.logger.formattedLog('voice');

    if (!IntakeUtils.isValidUplinkCountryCode(To) || !IntakeUtils.isValidUplinkCountryCode(From)) {
      twilioVoiceReponse.say('We’re sorry, your call cannot be connected. Uplink does not yet offer services in your country.');
      return twilioSuccess(RequestContext, twilioVoiceReponse.toString());
    }

    console.info(`${From} is attempting to call ${To}`);

    console.info('Looking for matching physicalNumbers in the database');
    const destinationPhoneNumbers: PhoneNumber[] = await Services.PhoneService.findContactOrUserSystemNumbers(To);
    const originatingUsers: User[] = await Services.UserService.findContactOrUserByPhysicalNumber(From);

    console.info('Determining which side is the User and Contact');
    let [userPhone] = destinationPhoneNumbers.filter(d => d.type === PhoneType.USER || d.type === PhoneType.FORWARD || d.type === PhoneType.UNASSIGNED);
    if (userPhone && userPhone.type === PhoneType.UNASSIGNED) {
      console.error(`${To} is an UNASSIGNED User Number. Terminating call.`);
      // contact calling unassigned user phone
      twilioVoiceReponse.say('');
      return twilioSuccess(RequestContext, twilioVoiceReponse.toString());
    }
    let contactPhone: PhoneNumber;
    let organization: string;
    let user: User;
    let contact: User;
    let fromNumber: PhoneNumber;
    let toNumber: PhoneNumber;

    if (!userPhone) {
      // user -> contact
      console.info(`${To} is not a User Number`);
      [user] = originatingUsers.filter(d => d.type === UserType.USER);
      if (!user){
        console.error(`Neither ${To} or ${From} is a User Number. Terminating call.`);
        // no user found
        twilioVoiceReponse.say('');
        return twilioSuccess(RequestContext, twilioVoiceReponse.toString());
      }
      console.info(`${From} is a User`);
      userPhone = user.phoneNumber;
      organization = user.organization_id;
      console.info(`Checking to see if ${To} is associated to a Contact`);
      [contactPhone] = destinationPhoneNumbers.filter(d => d.organization_id === organization && d.type === PhoneType.CONTACT);
      if (!contactPhone){
        // user calling contact that doesnt exist
        console.error('Could not find a contact associated with this number. Terminating call.');
        twilioVoiceReponse.say('We’re sorry, your call cannot be connected. There is no Contact associated with this number in your Uplink organization.');
        return twilioSuccess(RequestContext, twilioVoiceReponse.toString());
      }
      console.info(`${To} is associated to a Contact`);
      contact = contactPhone.user;
      fromNumber = userPhone;
      toNumber = contactPhone;
    } else {
      // contact -> user
      organization = userPhone.organization_id;
      if (userPhone.type === PhoneType.FORWARD){
        console.info(`${To} is associated to a Forwarded User Number`);
        userPhone = await Services.PhoneService.findUserNumberByForward(organization, userPhone.id);
      }
      user = userPhone.user;
      toNumber = userPhone;
      [contact] = originatingUsers.filter(d => d.organization_id === organization && d.type === UserType.CONTACT);
      if (!contact){
        console.info(`Could not find a Contact associated with ${From}`);
        const [secondUser] = originatingUsers.filter(d => d.organization_id === organization && d.type === UserType.USER);
        if (secondUser) {
          // user calling user
          console.error(`${From} is associated with a User. This is not allowed by Uplink.`);
          twilioVoiceReponse.say('We’re sorry, your call cannot be connected to another User in your Uplink organization.');
          return twilioSuccess(RequestContext, twilioVoiceReponse.toString());
        }
        // create a contact

        console.info('need to create a contact');
        contact = await Services.UserService.createContact(organization, {
          physicalNumber: From,
        });
        console.info('contact has been created');
      }
      // If the contact is unassigned, we attempt to assign a contact number.
      fromNumber = await contactSystemNumberService.resolve(contact);
    }

    let conversation: Conversation = await Services.ConversationService.findWithPhoneNumbers(
      organization,
      userPhone,
      contact,
    );

    console.info(conversation);

    if (!conversation) {
      console.info('no conversation - creating');

      // If no conversation, create a new conversation and associate the id with both users
      conversation = await Services.ConversationService.create(organization, {
        user_phone_id: userPhone.id,
        contact_user_id: contact.id,
      });
      console.info('created');
    }
    await Services.MessageService.create(organization, {
      call_sid: CallSid,
      call_status: 'INCOMPLETE',
      conversation_id: conversation.id,
      direction: (toNumber.type === PhoneType.CONTACT) ? DirectionType.OUTBOUND : DirectionType.INBOUND,
      from_phone_id: fromNumber.id,
      media: '[]',
      to_phone_id: toNumber.id,
      type: MessageType.CALL,
      // TODO: Update these to account for User-to-User
      recipient_snapshot: JSON.stringify(toNumber.type === PhoneType.CONTACT ? contact : user),
      sender_snapshot: JSON.stringify(toNumber.type === PhoneType.CONTACT ? user : contact),
    });

    // update phone number with last communcation
    await Services.PhoneService.update(organization, {
      id: toNumber.id,
      last_communication: new Date().toISOString(),
    });

    RequestContext.logger.formattedLog('dial');
    const dialNumber = toNumber.user.physicalNumber;

    const dial = twilioVoiceReponse.dial({
      callerId: fromNumber.systemNumber
    });

    console.info(`DIAL NUMBER ${dialNumber}`);

    // TODO: This call to number may require the URL of the webhook
    dial.number({ statusCallbackEvent: 'initiated ringing answered completed' }, dialNumber);

    console.info(twilioVoiceReponse.toString());

    return twilioSuccess(RequestContext, twilioVoiceReponse.toString());
  }
  catch (e) {
    console.error(`Voice intake system error: ${e.message}`);
    twilioVoiceReponse.say('Uplink has encountered an internal system error. Terminating call.');
    return twilioSuccess(RequestContext, twilioVoiceReponse.toString());
  }
};
