import { randomBytes } from 'crypto';
import Logger, { LogMethod } from '../../../../lib/logger';
import { Context } from '../context';
import { PhoneNumberController } from '../controllers';
import { PhoneNumber, User } from '../models';
import MessageSender from './messageSender';
import { getReassignmentNotification } from './systemMessages';
import {
  LockServiceLock,
  PhoneType,
  UserType,
} from '../@types';

const CONTACT_SYSTEM_NUMBER_LOCK_NAMESPACE = 'contact_system_numbers';

export default class ContactSystemNumberService {
  private _lock: LockServiceLock;
  private info: LogMethod;
  private warn: LogMethod;

  public constructor(private ctx: Context) {
    const pid = randomBytes(8).toString('hex');
    this.info = new Logger('uplink/lib/contactSystemNumber:info', pid).log;
    this.warn = new Logger('uplink/lib/contactSystemNumber:warn', pid).log;
  }

  /**
   * Lock an organization's Contact system number pool.
   * @param orgId The org to lock
   */
  private async lock(orgId: string) {
    this.info(`Locking the Contact system number pool for org ${orgId} to prevent concurrent access...`);
    this._lock = await this.ctx.locks.acquire(`${CONTACT_SYSTEM_NUMBER_LOCK_NAMESPACE}:${orgId}`, 1000);
    this.info('Pool locked.');
  }

  /**
   * Release the current lock.
   */
  private async unlock() {
    this.info(`Unlocking the Contact system number pool for org ${this.lock.name}...`);
    await this._lock.release();
    this.info('Pool unlocked.');
  }

  /**
   * A limit can be applied to the allowed Contact system number pool size for
   * testing and/or debug purposes.
   */
  private get contactPoolSizeLimit() {
    if (process.env.DEBUG_CONTACT_POOL_SIZE_LIMIT.toUpperCase() === 'FALSE') {
      return Infinity;
    } else if (process.env.STAGE.includes('prod')) {
      this.warn(`DEBUG_CONTACT_POOL_SIZE_LIMIT should be FALSE in production. Instead it is ${process.env.DEBUG_CONTACT_POOL_SIZE_LIMIT}. This setting will be ignored.`);
      return Infinity;
    }
    const limit = parseInt(process.env.DEBUG_CONTACT_POOL_SIZE_LIMIT, 10);

    if (!Number.isInteger(limit) || limit < 0) {
      throw new TypeError(`DEBUG_CONTACT_POOL_SIZE_LIMIT should be a positive integer. Instead, it is ${process.env.DEBUG_CONTACT_POOL_SIZE_LIMIT}`);
    }
    return limit;
  }

  /**
   * Reassign a Contact system number for its org. Also, send notifications to * all Users engaged in conversation with the previous Contact in posession
   * of that number with respect to that org to inform them that the number has * been reassigned.
   *
   * NOTE: There must be a lock on the org's contact pool prior to calling this
   * method. Otherwise, multiple processes (Lambdas) may call this method,
   * resulting in a race condition for the assignment.
   *
   * NOTE 2: While the scope of this method is fairly broad, the decision to
   * combine the assignment and the notification delivery is deliberate and
   * serves three purposes:
   *
   *  1. Current business requirements (4/19/19) stipulate that notifications
   *     should always be delivered on a Contact number reassignment. This
   *     enforces that behavior.
   *  2. Reassignment MUST happen AFTER the list of User physical numbers
   *     engaged in conversation has been determined. If the assignment
   *     happens first, it becomes impossible to do the lookup because the
   *     relationships have changed. By keeping these methods together, it
   *     becomes impossible to do this out of order.
   *  3. This method provides a convenient place to implement manual
   *     Contact system number recycling (without assignment to a new Contact).
   *     To implement this (given the way the Contact pools work as of 4/19/19),
   *     simply DELETE the specified number rather than updating its user_id.
   *
   * @param contactSystemNumber The Contact system number being reassigned
   * @param newAssignee The Contact to assign the number to
   * @returns The reassigned system number
   */
  private async reassign(contactSystemNumber: PhoneNumber, newAssignee: User) {
    // Sanity check the Contact system number.
    if (
      !(contactSystemNumber instanceof PhoneNumber) ||
      contactSystemNumber.type !== PhoneType.CONTACT
    ) {
      throw new TypeError(`Invalid argument passed to reassign(). "contactSystemNumber" must be a PhoneNumber of type "CONTACT". Received ${contactSystemNumber}`);
    }
    const orgId = contactSystemNumber.organization_id;

    // Sanity check the new assignee.
    if (!(newAssignee instanceof User) || newAssignee.type !== UserType.CONTACT) {
      throw new TypeError(`Invalid argument passed to reassign(). "newAssignee" must be a User of type "CONTACT". Received ${newAssignee}`);
    } else if (orgId !== newAssignee.organization_id) {
      throw new Error(`Invalid argument(s) passed to reassign(). The organization_id for "contactSystemNumber" and "newAssignee" must match. Received ${orgId} and ${newAssignee.organization_id} respectively.`);
    }

    // Sanity check the lock.
    if (!this._lock || this._lock.released || this._lock.name !== `${CONTACT_SYSTEM_NUMBER_LOCK_NAMESPACE}:${orgId}`) {
      throw new Error(`The ContactSystemNumberService must be locked for the ${orgId} org before calling reassign()for that org`);
    }
    this.info(`Reassigning system number ${contactSystemNumber.id} to Contact ${newAssignee.id}. Checking for a previous assignee first...`);

    const oldAssignee = await User.query(this.ctx.db)
      .joinRelation('phoneNumber')
      .where({
        'phoneNumber.organization_id': orgId,
        'phoneNumber.systemNumber': contactSystemNumber.systemNumber,
      })
      .eager('phoneNumber')
      .first() as User;

    let userPhysicalNumbersToNotify: string[] = [];

    if (oldAssignee instanceof User) {
      // Sanity check the old assignee
      if (
        oldAssignee.organization_id !== orgId ||
        oldAssignee.type !== UserType.CONTACT
      ) {
        throw new Error(`Expected the old assignee to of type CONTACT in org ${orgId}. Received ${oldAssignee}`);
      }
      this.info(`Previous assignee ${oldAssignee.id} found. Determining Users to send recycling notifications to...`);
      // Here we retrieve the physical numbers for all Users engaged in
      // conversation with the old Contact. We need these to know who to send
      // notifications to, so they may reengage, if necessary.
      //
      // NOTE: As mentioned above, this MUST happen prior to the number update.
      userPhysicalNumbersToNotify = Array.from(new Set((await this.ctx.db
        .select('users.physicalNumber')
        .from(this.ctx.db.raw('users as contacts'))
        // Join 1: We need to find conversations the old Contact has been in.
        .innerJoin('conversations', 'conversations.contact_user_id', 'contacts.id')
        // Join 2: We need to find the User system numbers engaged in the
        // aforementioned conversations.
        .innerJoin(this.ctx.db.raw('phonenumbers as userNumbers'), 'userNumbers.id', 'conversations.user_phone_id')
        // Join 3: We need to find the Users currently in posession of the
        // aforementioned User system numbers.
        .innerJoin('users', (qb) => {
          // In the case that a conversation with the relevant Contact system
          // number has been forwarded to another User but that User has not
          // engaged with the Contact (with their own User number), we should
          // account for conversations related through forwards.
          qb.on('users.id', 'userNumbers.user_id')
            .orOn('users.id', 'userNumbers.forward_id');
        })
        .where({
          'contacts.id': oldAssignee.id,
          'conversations.organization_id': orgId, // SANITY
          'userNumbers.organization_id': orgId, // SANITY
          'users.organization_id': orgId, // SANITY
        }) as User[])
        .map(user => user.physicalNumber)));
      this.info(`Found ${userPhysicalNumbersToNotify.length} User physical numbers to notify.`);
    } else {
      this.info('No previous assignee found.');
    }
    this.info('Updating the number assignment...');
    // Update the phone number assignment to belong to the new Contact.
    //
    // NOTE: As mentioned above, this is where recycling (without assignment)
    // can be implemented.
    contactSystemNumber = await PhoneNumber.query(this.ctx.db)
      .updateAndFetchById(contactSystemNumber.id, { user_id: newAssignee.id });

    this.info(`Number assignment updated. Sending reassignment notifications to ${userPhysicalNumbersToNotify.length} Users...`);

    // NOTE: The sending of notifications occurs after the number assignment to
    // ensure the assignment has actually occurred. If the assignment threw an
    // error, we won't reach this spot.
    const recyclingNotification = getReassignmentNotification(oldAssignee.physicalNumber);
    // NOTE: We ensure User physical numbers are unique here so we don't send
    // duplicate notifications to the same User for one recycling event (a User
    // may be engaged in multiple conversations with one Contact in the case of
    // number forwarding.
    await Promise.all(Array.from(new Set(userPhysicalNumbersToNotify)).map(
      userPhysicalNumber => new MessageSender(this.ctx.db).sendMessage(
        userPhysicalNumber,
        contactSystemNumber.systemNumber,
        recyclingNotification,
      ),
    ));
    this.info('Reassignment notifications sent.');

    return contactSystemNumber;
  }

  /**
   * Find or assign a valid system number for a given contact with respect to
   * an org.
   * @param contact The Contact to resolve for
   * @returns The resolved system number
   */
  public async resolve(contact: User) {
    if (!(contact instanceof User) || contact.type !== UserType.CONTACT) {
      throw new TypeError(`Invalid argument passed to resolve(). "contact" must be a User of type "CONTACT". Received ${contact}`);
    }
    this.info(`Resolving a system number for Contact ${contact.id}. Checking for an existing number first...`);
    // Check to see if the Contact already has a system number for the org.
    let systemNumber = await PhoneNumber.query(this.ctx.db)
      .findOne({
        organization_id: contact.organization_id,
        user_id: contact.id,
      });

    if (!(systemNumber instanceof PhoneNumber)) {
      this.info('No number is currently assigned to the Contact.');
      // We use a mutual exclusion lock on the contact number assignment system
      // so multiple concurrent processes can't assign the same number for an
      // org. Since pools are org-scoped, the lock can be org-scoped as well.
      await this.lock(contact.organization_id);
      this.info('Checking the org\'s Contact system number pool for an available number...');

      // We get the entire set of used Contact system numbers for the org.
      const orgContactSystemNumbers = (await this.ctx.db('phonenumbers')
        .select('systemNumber')
        .where({
          organization_id: contact.organization_id,
          type: PhoneType.CONTACT,
        }) as PhoneNumber[])
        .map(contactSystemNumber => contactSystemNumber.systemNumber);
      // Then we see which numbers from the global pool are not being used.
      const availableContactPoolNumber = await PhoneNumber.query(this.ctx.db)
        .findOne({
          organization_id: 'lunar-pool',
          // TODO: Fix the condition where lunar-pool numbers are being reassigned
          // from type "POOL" so we can add this additional sanity check.
          // type: PhoneType.POOL,
        })
        .whereNotIn('systemNumber', orgContactSystemNumbers);

      if (
        availableContactPoolNumber instanceof PhoneNumber &&
        orgContactSystemNumbers.length < this.contactPoolSizeLimit
      ) {
        this.info(`Contact system number ${availableContactPoolNumber.systemNumber} is available for assignment. Creating assignment entry...`);
        systemNumber = await PhoneNumber.query(this.ctx.db)
          .insertAndFetch({
            organization_id: contact.organization_id,
            sid: availableContactPoolNumber.sid,
            systemNumber: availableContactPoolNumber.systemNumber,
            type: PhoneType.CONTACT,
            user_id: contact.id,
          });
      } else {
        if (availableContactPoolNumber instanceof PhoneNumber) {
          this.info('There are spare numbers in the pool but this org has reached or exceeded its pool size limit.');
        } else {
          this.info('There are no spare numbers left in the pool.');
        }
        // There are no unused pool numbers, we have to recycle an org number.
        // We now find the least active Contact number in the org to recycle in
        // the next step.
        systemNumber = await new PhoneNumberController(this.ctx.db).getLeastActiveContactNumber(contact.organization_id);
        // Perform the assignment.
        // NOTE: We still have to update the number again because the user_id
        // and updated_at are changed during reassignment.
        systemNumber = await this.reassign(systemNumber, contact);
      }
      this.info('Assignment complete.');
      // Release the lock so other processes can use it.
      await this.unlock();
    }

    if (systemNumber.type !== PhoneType.CONTACT) {
      throw new Error(`System number should be of type ${PhoneType.CONTACT} but is of type ${systemNumber.type}.`);
    }
    return systemNumber;
  }
}