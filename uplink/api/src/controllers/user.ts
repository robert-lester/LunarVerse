import * as Knex from 'knex';
import { CoreController } from './core';
import Logger from '../../../../lib/logger';
import {
  IControllerIndex,
  IControllerUpdate,
  IControllerDelete,
} from './interfaces';
import {
  MessageType,
  PhoneType,
  StartConversationReferrer,
  UserType,
} from '../@types';
import {
  BlockList,
  PhoneNumber,
  User,
} from '../models';
import TwilioClient from '../lib/twilio';
import { parsePhoneNumber } from '../lib/phoneParse';
import MessageSender from '../lib/messageSender';
import { PhoneNumberController } from './phoneNumber';

export class UserController extends CoreController
  implements
  IControllerIndex<User>,
  IControllerUpdate<User>,
  IControllerDelete {
  private logger: Logger;
  private twilio: TwilioClient;

  constructor(connection: Knex) {
    super(connection);
    this.logger = new Logger('uplink:server:user');
    // TODO: Refactor to inject the TwilioClient as a dependency
    this.twilio = new TwilioClient();
  }

  /**
   * Retrieve all Users in a given organization
   * @param organization The organization the user belongs to
   */
  public index(organization: string): Promise<User[]> {
    this.connect();
    return User.query(this.connection)
      .where({
        organization_id: organization,
        type: UserType.USER,
      })
      .eager('[phoneNumber]');
  }

  /**
   * Retrieves a list of users by phone number id
   * @param organization The organization the phone number belongs to
   * @param id The user ids to lookup
   */
  public async findContactOrUserBySystemNumber(organization: string, number: string): Promise<User[]> {
    this.connect();
    const lookUpNumber = parsePhoneNumber(number);

    const users = (await User.query(this.connection)
      .where('users.organization_id', organization)
      .joinRelation('phoneNumber')
      .where('phoneNumber.systemNumber', lookUpNumber)
      .eager('phoneNumber')) as User[];

    return users;
  }

  /**
   * Find user record by physical phone number
   * @param number physical phone number of user
   */
  public async findContactOrUserByPhysicalNumber(number: string): Promise<User[]> {
    this.connect();
    const lookUpNumber = parsePhoneNumber(number);

    const user = await User.query(this.connection)
      .where('physicalNumber', lookUpNumber)
      .eager('phoneNumber');
    return user;
  }

  /**
   * Find user record by physical phone number
   * @param number physical phone number of user
   */
  public async findContactOrUserByNumberAndOrg(organization: string, number: string): Promise<User> {
    this.connect();
    const lookUpNumber = parsePhoneNumber(number);

    const [user] = await User.query(this.connection)
      .where('physicalNumber', lookUpNumber)
      .andWhere('organization_id', organization)
      .eager('phoneNumber');
    return user;
  }

  /**
   * Creates a new User record in the database
   * @param organization The organization the user belongs to
   * @param attributes Attributes to be assigned to new User record
   */
  public async createUser(organization: string, attributes: Partial<User>): Promise<User> {
    this.connect();

    let { physicalNumber } = attributes;
    physicalNumber = parsePhoneNumber(physicalNumber);

    if (await new PhoneNumberController(this.connection).isUplinkNumber(attributes.physicalNumber)) {
      throw new Error('Cannot add Uplink number as User phone number');
    }

    const existingAccounts = await this.findContactOrUserByPhysicalNumber(physicalNumber);
    // Check if a User already exists with this Phone Number
    const existingUser = existingAccounts.filter(user => user.type === UserType.USER);

    if (existingUser.length > 0) {
      throw new Error('The phone number already exists as a User in Uplink.');
    }
    // Check if a Contact already exists with this Phone Number in the same organization
    const existingContact = existingAccounts.filter(contact => contact.organization_id === organization);

    if (existingContact.length) {
      throw new Error('The phone number already exists as a Contact in this org.');
    }

    const insert = Object.assign({}, attributes, {
      created_at: new Date(),
      updated_at: new Date(),
      organization_id: organization,
      physicalNumber,
      type: UserType.USER,
    });

    return User.query(this.connection).insertGraphAndFetch(insert);
  }

  /**
   * Create a new User in the database
   * @param organization The organization the contact belongs to
   * @param attributes A map of attributes to add to the new resource
   * @param phoneOptions Optional phone options for twilio number
   * @return Promise containing the new User
   */
  public async createContact(
    organization: string,
    attributes: Partial<User>,
  ): Promise<User> {
    this.connect();
    let { physicalNumber } = attributes;
    physicalNumber = parsePhoneNumber(physicalNumber);

    const insert = Object.assign({}, attributes, {
      created_at: new Date(),
      updated_at: new Date(),
      organization_id: organization,
      physicalNumber,
      type: UserType.CONTACT,
    });
    return User.query(this.connection).insertGraphAndFetch(insert);
  }

  /**
   * Updates specific user and sends assignment text if system phone number updated
   * @param organization The organization the user belongs to
   * @param attributes User attributes to be updated
   *
   * TODO: Fix the type signature here since neither the passed nor received type is correct
   */
  public async update(organization: string, attributes: any): Promise<User> {
    this.connect();
    let user: User;

    if (attributes.phoneNumber) {
      attributes.phoneNumber = this.buildGraphPhoneObject(attributes.phoneNumber);
    }
    if (attributes.physicalNumber) {
      // check if number in the system
      attributes.physicalNumber = parsePhoneNumber(attributes.physicalNumber);

      if (await new PhoneNumberController(this.connection).isUplinkNumber(attributes.physicalNumber)) {
        throw new Error('Cannot add Uplink number as User phone number');
      }
      const exisitingUser = await this.findContactOrUserByPhysicalNumber(attributes.physicalNumber);
      if (exisitingUser.length > 0) {
        throw new Error('The phone number for this user is already in use in Uplink.');
      }
    }
    const res = await User.query(this.connection)
      .upsertGraphAndFetch(attributes, { relate: true, unrelate: true })
      .where('organization_id', organization)
      .eager('phoneNumber');

    if (Array.isArray(res)) {
      user = res.shift();
    } else {
      user = res;
    }
    if (!user) {
      return null;
    }

    // only send assignment message if user
    if (attributes.phoneNumber && user.type === UserType.USER) {

      this.logger.log('User has been assigned new number. Sending user assignment message');

      await this.twilio.sendMessage(
        user.phoneNumber.systemNumber,
        `SYSTEM MSG: You have been assigned this Uplink Number by your administrator.`,
        user.physicalNumber,
      );
    }

    return user;
  }

  /**
   * Deletes the User record from the database
   * @param organization The organization the user belongs to
   * @param id The user identifier
   */
  public async delete(organization: string, id: number): Promise<boolean> {
    this.connect();

    const user = await User.query(this.connection).eager('phoneNumber').findById(id);

    if (user && user.organization_id === organization) {
      if (user.phoneNumber){
        await PhoneNumber.query(this.connection).upsertGraphAndFetch({id: user.phoneNumber.id, type: PhoneType.UNASSIGNED, user: null}, {unrelate: true});
      }
      await User.query(this.connection).upsertGraph({ id, phoneNumber: null }, { unrelate: true });
      const res: number = await User.query(this.connection).deleteById(id);

      if (res > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Creates contact in Salesforce and sends messages to appropriate parties
   * @param contact User record belonging to contact
   * @param user User record belonging to user
   * @return Array of promises
   */
  public async notifyContact(contact: User, user: User, startConversationReferrer: StartConversationReferrer = null): Promise<any> {
    const msg = new MessageSender(this.connection);

    return await msg.send(contact.phoneNumber, user.phoneNumber, false, MessageType.USER, [], startConversationReferrer);
  }

  /**
   * Lookup a single user by id
   * @param organization Organization the user belongs to
   * @param id user id
   */
  public readSingle(organization: string, id: number): Promise<User> {
    this.connect();

    return User.query(this.connection)
      .where('organization_id', organization)
      .findById(id)
      .eager('phoneNumber');
  }

  /**
   * Builds Graph insert object for the user->phonenumbers relationship
   * @param phoneNumbers Array of phone number ids
   */
  private buildGraphPhoneObject(phoneNumbers: number[]) {
    return phoneNumbers.map(p => ({
      id: p,
    }));
  }

  /**
   * Gets the data from the Blocklist table.
   * Either from two specific ids or entire list.
   * @param fromId User Id of from phone number
   * @param toId User Id of to phone number
   * @return Promise of DB results
   */
  public async checkBlocklistForIds(fromId = null, toId = null) {
    this.connect();

    if (fromId !== null && toId !== null) {
      return BlockList.query(this.connection)
        .where('from_user_id', fromId)
        .andWhere('to_user_id', toId);
    }

    return BlockList.query(this.connection);
  }

  /**
   * Either inserts or updates an exists row
   * inside of the Blocklist table.
   * @param fromId User Id of from phone number
   * @param toId User Id of to phone number
   * @param orgId Organization Id of phone numbers
   * @param blocked boolean
   * @return Promise of DB results
   */
  public async upsertBlocklist(fromId: number, toId: number, orgId: string, blocked: boolean) {
    this.connect();

    const blockListExists = await this.checkBlocklistForIds(fromId, toId);

    if (blockListExists.length) {
      return BlockList.query(this.connection)
        .patch({ blocked })
        .where('from_user_id', fromId)
        .andWhere('to_user_id', toId);
    }

    return BlockList.query(this.connection)
      .insert({
        from_user_id: fromId,
        to_user_id: toId,
        organization_id: orgId,
        blocked,
      });
  }
}
