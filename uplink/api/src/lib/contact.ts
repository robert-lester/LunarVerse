import { ServicesContext, Context } from '../context';
import { UserType, PhoneType } from '../@types';
import { User } from '../models';
import ContactSystemNumberService from './contactSystemNumbers';
import { ClientErrors } from '../../../lib/api-errors/ErrorCodes';

/**
 * ContactUtils is the namespace for contact-type User related utility methods
 * TODO: Business logic that is not strictly controller or model related and
 * common to both the REST and GraphQL APIs needs a better naming convention
 * and location.
 */
export default abstract class ContactUtils {
  /**
   * Given a valid phone number, get a "Contact" type of User
   *
   * @static
   * @memberof ContactUtils
   * @param context Provides access to application services
   * @param organization The organization to which a "Contact" belongs
   * @param phoneNumber A valid phone number
   * @return A "Contact" type of User or null if the phone number is already an Uplink system number
   */
  static readonly getContact = async (context: Context, phoneNumber: string): Promise<User | null> => {
    const services: ServicesContext = context.Services;
    const organization = context.organization;
    const [uplinkPhoneNumber] = await context.Services.PhoneService.findContactOrUserSystemNumbers(phoneNumber);

    if (uplinkPhoneNumber) {
      switch (uplinkPhoneNumber.type) {
        // If the phone number is already related to a "Contact" type User,
        // then return that User
        case PhoneType.CONTACT: {
          if (uplinkPhoneNumber.user && uplinkPhoneNumber.user.type === UserType.CONTACT) {
            return uplinkPhoneNumber.user;
          }
          break;
        }
        // If the phone number is some other type of Uplink number,
        // then return null
        case PhoneType.USER:
        case PhoneType.FORWARD:
        case PhoneType.UNASSIGNED:
        case PhoneType.POOL:
        default:
            console.error(`The phone number passed is a '${JSON.stringify(uplinkPhoneNumber.type)}' and not a 'CONTACT' type`);
            return null;
      }
    }

    let user: User = await context.Services.UserService.findContactOrUserByNumberAndOrg(organization, phoneNumber);

    if (!user){
      user = await services.UserService.createContact(organization, {
        physicalNumber: phoneNumber,
      });
    }

    if (user.type === UserType.USER){
      console.error(ClientErrors.CANNOT_MESSAGE_USER_TO_USER);
      return null;
    }
    user.phoneNumber = await new ContactSystemNumberService(context).resolve(user);

    return user;
  }
}