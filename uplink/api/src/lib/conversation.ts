import { Context } from '../context';
import { User } from '../models';
import { UserType, StartConversationReferrer } from '../@types';
import ContactUtils from './contact';

/**
 * ConversationUtils is the namespace for Conversation related utility methods
 * TODO: Business logic that is not strictly controller or model related and
 * common to both the REST and GraphQL APIs needs a better naming convention
 * and location.
 */
export default abstract class ConversationUtils {
  /**
   * Attempt to start a User-initiated conversation with a Contact
   *
   * @static
   * @memberof ConversationUtils
   * @param context Provides access to application services
   * @param fromUser The User initiating the conversation
   * @param toContactPhysicalNumber The physical number to converse with
   * @return A "Contact" type of User
   */
  public static readonly startConversationFromUserToPhoneNumber = async (context: Context, fromUser: User, toContactPhysicalNumber: string): Promise<User> => {
    if (!fromUser || fromUser.type !== UserType.USER) {
        throw new Error('fromUser is invalid');
    }

    return ConversationUtils.findContactForUserAndSendNotification(context, fromUser, toContactPhysicalNumber, StartConversationReferrer.MOBILE);
  }

  /**
   * Attempt to get a Contact within the passed User's org and to send a
   * notification to the User letting them know the conversation has started
   *
   * @static
   * @memberof ConversationUtils
   * @param context Provides access to application services
   * @param user The User to start a conversation with
   * @param contactPhysicalNumber The physical number for which to search
   * @param startConversationReferrer The referrer of where the start conversation was requested
   */
  private static readonly findContactForUserAndSendNotification = async (context: Context, user: User, contactPhysicalNumber: string, startConversationReferrer: StartConversationReferrer): Promise<null|User> => {
    const contact = await ContactUtils.getContact(context, contactPhysicalNumber);

    if (contact instanceof User) {
      console.info(`Created contact "${contact.id}" with physical number "${contactPhysicalNumber}" and system number "${contact.phoneNumber.systemNumber}"`);
      await ConversationUtils.notifyUserOfConversationStart(context, contact, user, startConversationReferrer);
    }
    return contact;
  }

  /**
   * Send a notification of conversation start from the Contact to the User
   * TODO: Include logic to determine if a conversation needs to be created
   *
   * @static
   * @memberof ConversationUtils
   * @param context Provides access to application services
   * @param fromContact The Contact sending the notification
   * @param toUser The User receiving the notification
   * @param startConversationReferrer The referrer of where the start conversation was requested
   */
  private static readonly notifyUserOfConversationStart = async (context: Context, fromContact: User, toUser: User, startConversationReferrer: StartConversationReferrer): Promise<void> => {
    if (!fromContact.phoneNumber) {
      throw new ReferenceError('fromContact does not have a valid phone number reference');
    } else if (!toUser.phoneNumber) {
      throw new ReferenceError('toUser does not have a valid phone number reference');
    }
    await context.Services.UserService.notifyContact(fromContact, toUser, startConversationReferrer);
  }
}