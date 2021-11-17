import { Context } from '../../../context';
import { User, PhoneNumber } from '../../../models';
import { UserType, StartConversationReferrer } from '../../../@types';
import { ClientErrors } from '../../../../../lib/api-errors/ErrorCodes';
import APIError from '../../../../../lib/api-errors/APIError';
import { parsePhoneNumber } from '../../../lib/phoneParse';
import ContactSystemNumberService from '../../../lib/contactSystemNumbers';

// TODO: Change the API name for this to "startConversation" or similar since it
// doesn't necessarily create a contact
export default async (_: any, args: any, ctx: Context): Promise<PhoneNumber> => {
  console.info(args.userRealNumber);
  console.info('LOOKING FOR CONTACT');
  const contactSystemNumberService = new ContactSystemNumberService(ctx);

  const organization = ctx.Context.state.organization;
  const userRealNumber = parsePhoneNumber(args.userRealNumber);
  const contactRealNumber = parsePhoneNumber(args.contactRealNumber);

  if (!contactRealNumber) {
    throw new APIError(ClientErrors.INVALID_CONTACT_NUMBER);
  }

  if (!userRealNumber){
    throw new APIError(ClientErrors.CANNOT_CREATE_CONTACT_WITHOUT_USER_NUMBER);
  }
  const user = await ctx.Services.UserService.findContactOrUserByNumberAndOrg(organization, userRealNumber);

  if (!(user instanceof User)) {
    // TODO: Change this to a more appropriate error in the case that no User
    // has the number.
    throw new APIError(ClientErrors.CANNOT_CREATE_CONTACT_WITHOUT_USER_NUMBER);
  }

  if (user.type === UserType.CONTACT) {
    throw new APIError(ClientErrors.USER_CANNOT_BE_CONTACT);
  }

  if (!contactRealNumber){
    throw new APIError(ClientErrors.CANNOT_CREATE_CONTACT_WITHOUT_CONTACT_NUMBER);
  }
  let contactUser: User = await ctx.Services.UserService.findContactOrUserByNumberAndOrg(organization, contactRealNumber);
  console.info(contactUser);
  if (!contactUser){
    console.info('need to create a contact');
    contactUser = await ctx.Services.UserService.createContact(organization, {
      physicalNumber: contactRealNumber,
    });
    console.info('contact has been created');
  }
  if (contactUser.type === UserType.USER){
    throw new APIError(ClientErrors.CANNOT_MESSAGE_USER_TO_USER);
  }
  contactUser.phoneNumber = await contactSystemNumberService.resolve(contactUser);
  await ctx.Services.UserService.notifyContact(contactUser, user, StartConversationReferrer.SALESFORCE);
  return contactUser.phoneNumber;
};
