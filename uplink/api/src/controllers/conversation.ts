import { CoreController } from './core';
import {
  IControllerIndex,
  IControllerCreate,
  IControllerUpdate,
} from './interfaces';
import { Conversation, PhoneNumber, User } from '../models';
import { SortOptions } from '../@types';

export class ConversationController extends CoreController
  implements
  IControllerIndex<Conversation>,
  IControllerCreate<Conversation>,
  IControllerUpdate<Conversation> {
  /**
   * Retrieve all Conversations in a given organization
   * @param organization The organization the conversation belongs to
   */
  public index(organization: string): Promise<Conversation[]> {
    this.connect();
    return Conversation.query(this.connection)
      .where('organization_id', organization)
      .eager('[messages]');
  }

  /**
   * Find all conversations with messages between certain dates and times
   * for particular phone numbers.
   * @param organization The organization the conversations belong to
   * @param phoneNumbers An array of formatted phone numbers to check
   * @param initialDate A date time in the format "YYYY-MM-DD hh:mm:ss"
   * @param finalDate A date time in the format "YYYY-MM-DD hh:mm:ss"
   * @param sort The result can be sorted in ASC and DESC date times
   * @return An array of conversations
   */
  public async find(organization: string, phoneNumbers: string[], initialDate: string, finalDate: string, sort: SortOptions = SortOptions.ASC): Promise<Conversation[]> {
    this.connect();
    // The following SQL query right joins conversations and messages, joins
    // conversations and phonenumbers on user_phone_id. The returned set is
    // filtered based on USER system phone numbers or phone numbers belonging
    // to contacts. The set is further filtered based on message date times.
    // Finally, the results are grouped on conversation ID.
    //
    // select c.* from conversations as c
    //     right join messages as m on c.id=m.conversation_id
    //     join phonenumbers as p on c.user_phone_id=p.id
    //     where (
    //       (p.systemNumber in ('+15864744468','+18572714084')
    //          and p.organization_id='launch-that'
    //          and (p.type='USER' or p.type='FORWARD')
    //       )
    //       or
    //       (c.contact_user_id in (
    //          select u.id from users as u join phonenumbers as p2 on u.id=p2.user_id
    //            where p2.systemNumber in ('+19408717544')
    //            and p2.organization_id='launch-that'
    //            and p2.type='CONTACT'
    //          )
    //       )
    //     )
    //     and m.updated_at >= '2019-03-01' and m.updated_at < '2019-04-17' group by c.id;
    //
    // The only benefit to using the 'ORM' to generate this query is proper escaping
    // and adhering to the object model.
    const result = await Conversation.query(this.connection)
      .alias('c')
      .rightJoin('messages as m', 'c.id', 'm.conversation_id')
      .join('phonenumbers as p', 'c.user_phone_id', 'p.id')
      .where(builder => {
        if (phoneNumbers.length === 0) {
            builder.where('p.organization_id', '=', organization);
        }
        else {
          builder.where(systemNumberBuilder => {
            systemNumberBuilder.whereIn('p.systemNumber', phoneNumbers)
              .andWhere('p.organization_id', '=', organization)
              .andWhere(typeBuilder => {
                typeBuilder.where('p.type', '=', 'USER').orWhere('p.type', '=', 'FORWARD').orWhere('p.type', '=', 'UNASSIGNED');
              });
          }).orWhere(contactUserBuilder => {
            contactUserBuilder.whereIn('c.contact_user_id',
              User.query(this.connection)
                .alias('u')
                .select('u.id')
                .join('phonenumbers as p2', 'u.id', 'p2.user_id')
                .whereIn('p2.systemNumber', phoneNumbers)
                .andWhere('p2.organization_id', '=', organization)
                .andWhere('p2.type', '=', 'CONTACT')
            );
          });
        }
      })
      .andWhere('m.updated_at', '>=', initialDate)
      .andWhere('m.updated_at', '<=', finalDate)
      .groupBy('c.id')
      .orderBy('c.updated_at', sort === SortOptions.ASC ? 'asc' : 'desc');

    return result;
  }

  /**
   * Creates a new Conversation record
   * @param organization The organization the conversation belongs to
   * @param attributes The attributes to be assigned to the conversation
   */
  public create(organization: string, attributes: Partial<Conversation>): Promise<Conversation> {
    this.connect();

    const insert = Object.assign({}, attributes, {
      created_at: new Date(),
      updated_at: new Date(),
      organization_id: organization,
      conversation_last_started_at: new Date(),
    });

    return Conversation.query(this.connection).insertGraphAndFetch(insert, {
      relate: true,
    });
  }

  /**
   * Updates an existing Conversation
   * @param organization The organization the conversation belongs to
   * @param attributes The attributes to be assigned to the conversation
   */
  public async update(organization: string, attributes: Partial<Conversation>): Promise<Conversation> {
    this.connect();

    let conversation;
    const res = await Conversation.query(this.connection)
      .upsertGraphAndFetch(attributes, { relate: true, unrelate: true })
      .where('organization_id', organization)
      .eager('[messages]');

    if (Array.isArray(res)) {
      conversation = res.shift();
    } else {
      conversation = res;
    }

    if (!conversation) {
      return null;
    }

    return conversation;
  }

  /**
   * Looks for existing conversation between specific phone numbers
   * @param numbers Numbers associated with a conversation
   * @return A promise containing a single conversation
   */
  public async findWithPhoneNumbers(organization: string, userPhone: PhoneNumber, contactUser: User): Promise<Conversation> {
    this.connect();

    console.info('find with phone numbers');
    const [conversation] = await Conversation.query(this.connection).where('user_phone_id', userPhone.id).andWhere('contact_user_id', contactUser.id).andWhere('organization_id', organization).eager('[messages]');
    return conversation;
  }

  public async findByUserPhone(userPhones: PhoneNumber[]) {
    const userPhoneIds = userPhones.map(u => u.id);
    console.info('USER PHONE IDS');
    console.info(userPhoneIds);
    return Conversation.query(this.connection).whereIn('user_phone_id', userPhoneIds).eager('[messages]');
  }

  public async findByContactUser(contactUsers: User[]) {
    const contactUserIds = contactUsers.map(c => c.id);
    return Conversation.query(this.connection).whereIn('contact_user_id', contactUserIds).eager('[messages]');
  }

  /**
   * Lookup a single conversation by id
   * @param organization Organization the conversation belongs to
   * @param id Conversation id
   * @deprecated
   */
  public readSingle(organization: string, id: number): Promise<Conversation> {
    this.connect();
    return Conversation.query(this.connection)
      .where('organization_id', organization)
      .findById(id);
  }

  /**
   * Find a single conversation by public_id
   * @param orgId The ID for the org the Conversation belongs to
   * @param publicId The Conversation's public ID
   */
  public readByPublicId(orgId: string, publicId: string): Promise<Conversation> {
    this.connect();

    return Conversation.query(this.connection).findOne({
      organization_id: orgId,
      public_id: publicId,
    });
  }
}
