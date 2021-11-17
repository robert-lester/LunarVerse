import * as DataLoader from 'dataloader';
import * as Knex from 'knex';
import { Conversation, PhoneNumber, User, Message } from '../models';
import { UserType } from '../@types';

import sort from 'dataloader-sort';
/**
 * To understand why we are using dataloader-sort read https://github.com/graphql/dataloader/issues/66
 * Library referenced here https://github.com/graphql/dataloader/issues/66#issuecomment-292233836
 *
 * A batch loading function accepts an Array of keys, and returns a Promise which
 * resolves to an Array of values. There are a few constraints that must be upheld:
 *
 * The Array of values must be the same length as the Array of keys.
 * Each index in the Array of values must correspond to the same index in the Array of keys.
 *
 * For example, if your batch function was provided the Array of keys: `[ 2, 9, 6, 1 ]`,
 * and loading from a back-end service returned the values:
 * ```js
 * { id: 9, name: 'Chicago' }
 * { id: 1, name: 'New York' }
 * { id: 2, name: 'San Francisco' }
 * ```
 * Our back-end service returned results in a different order than we requested, likely
 * because it was more efficient for it to do so. Also, it omitted a result for key `6`,
 * which we can interpret as no value existing for that key.
 *
 * To uphold the constraints of the batch function, it must return an Array of values
 * the same length as the Array of keys, and re-order them to ensure each index aligns
 * with the original keys `[ 2, 9, 6, 1 ]`:
 * ```js
 * [
 *   { id: 2, name: 'San Francisco' },
 *   { id: 9, name: 'Chicago' },
 *   null,
 *   { id: 1, name: 'New York' }
 * ]
 * ```
 */

/**
 *  Handle all instances of data loaders
 * @alias module:DataLoadersContext
 */
export class DataLoadersContext {

  public ConversationDataLoader: { conversationById: any; };
  public MessageDataLoader: { messageById: any; };
  public UserDataLoader: { userById: any; userByPhysicalNumber: any; };
  public PhoneDataLoader: { phoneById: any; phoneByNumber: any; phoneByUser: any; };

  constructor(private connection: Knex) {

    this.ConversationDataLoader = this.initializeConversationDataLoader();
    this.MessageDataLoader = this.initializeMessageDataLoader();
    this.PhoneDataLoader = this.initializePhoneDataLoader();
    this.UserDataLoader = this.initializeUserDataLoader();
  }

  private initializeConversationDataLoader() {
    return {
      conversationById: new DataLoader(async (ids: number[]) => {
        const conversations = await Conversation.query(this.connection)
          .findByIds(ids)
          .eager('[messages, userPhone, contactUser]');

        const results = sort(ids, conversations, 'id');
        return results;

      })
    };
  }

  private initializeMessageDataLoader() {
    return {
      messageById: new DataLoader(async (publicIds: string[]) => {
        const messages = await Message.query(this.connection)
          .whereIn('public_id', publicIds)
          .eager('[phoneNumber]');

        const messagesWithPublicId = publicIds.map((publicId) => {
          const message = messages.find(m => m.public_id === publicId);
          return message instanceof Message ? Message.format(message) : undefined;
        });

        const results = sort(publicIds, messagesWithPublicId, 'public_id');
        return results;
      })
    };
  }

  private initializePhoneDataLoader() {
    return {
      phoneById: new DataLoader(async (ids: number[]) => {
        const phoneNumbers = await PhoneNumber.query(this.connection)
          .findByIds(ids)
          .eager('[user, messages]');

        const result = sort(ids, phoneNumbers, 'id');
        return result;

      }),
      phoneByNumber: new DataLoader(async (numbers: string[]) => {
        const phoneNumbers = await PhoneNumber.query(this.connection)
          .whereIn('systemNumber', numbers)
          .eager('[user, messages]');

        const results = sort(numbers, phoneNumbers, 'systemNumber');
        return results;
      }),
      phoneByUser: new DataLoader(async (ids: number[]) => {
        const phoneNumbers = await PhoneNumber.query(this.connection)
          .whereIn('user_id', ids)
          .eager('[user, messages]');

        const results = sort(ids, phoneNumbers, 'user_id');
        return results;
      })
    };
  }

  private initializeUserDataLoader() {
    return {
      userById: new DataLoader(async (ids: number[]) => {
        const users = await User.query(this.connection)
        .findByIds(ids)
        .eager('phoneNumber');

        const results = sort(ids, users, 'id');
        return results;
      }),
      userByPhysicalNumber: new DataLoader(async (numbers: string[]) => {
        const users = await User.query(this.connection)
          .whereIn('physicalNumber', numbers)
          .andWhere('type', UserType.USER)
          .eager('phoneNumber');

        const usersWithPhysicalNumber = numbers.map((number) => {
          const user = users.find(u => u.physicalNumber === number);

          return user instanceof User ? user : undefined;
        });

        const results = sort(numbers, usersWithPhysicalNumber, 'physicalNumber');
        return results;
      })
    };
  }
}