import { CoreController } from './core';
import { IControllerCreate } from './interfaces';
import { Message } from '../models';
import {
  DirectionType,
  IUsageDetails,
  MessageType,
} from '../@types';
import { getBillableUnitsQueryBuilder } from '../lib/usage';

// TODO: Improve some of the types below.
// I'd like the parent for the usage methods to accept a spread param like so:
//
// type BillableUsageParams = [string, Date, Date, DirectionType, Array<number>];
//
// Unfortunately, the compiler doesn't recognize tuples as valid extensions of
// the Array class so it throws.
//
// We also need to find a workaround so casting fields as in the Objection
// usage queries can return something type-safe and we don't have to cast to
// "any".

export class MessageController extends CoreController implements IControllerCreate<Message> {
  /**
   * Creates a new Message record
   * @param organization The organization the message belongs to
   * @param attributes The attributes to be assigned to the message
   */
  public async create(organization: string, attributes: Partial<Message>): Promise<Message> {
    this.connect();

    if (!attributes.media || !attributes.media.length){
      attributes.media = null;
    }

    if (typeof MessageType[attributes.type] !== 'string') {
      throw new Error(`${attributes.type} is not a valid Message type`);
    }
    const insert = Object.assign({}, attributes, {
      created_at: new Date(),
      updated_at: new Date(),
      organization_id: organization,
      media: attributes.media,
    });
    // Set initial billable units for SMS and media messages that aren't system messages
    if (!attributes.billable_units) {
      insert.billable_units = insert.type !== undefined &&
        insert.type === MessageType.USER &&
        typeof insert.message === 'string' &&
        !insert.message.startsWith('SYSTEM MSG:') ? 1 : 0;
    }
    return Message.query(this.connection).insertGraphAndFetch(insert);
  }

  public async update(sid: string, attributes: Partial<Message>): Promise<void> {
    this.connect();

    await Message.query(this.connection)
      .where('call_sid', sid)
      .update(Object.assign({}, attributes, {
        updated_at: new Date(),
      }));
  }

  /**
   * Find messages from a specific conversation with filtering attributes
   * @param organization the organization the message belongs to
   * @param conversationId the Id of the conversation that that the message belongs to
   * @param date the date to filter where to start looking for messages
   * @param limit the number of messages to return
   * @param offset the number to offset the messages
   */
  public async findMessagesByDate(
    organization: string,
    conversationId: number,
    date: string,
    limit: number,
    offset: number,
  ): Promise<Message[]> {
    let operator = '<=';
    let order = 'DESC';
    // Flipping the direction of the order and the operator
    // is equivalent to negative offsets
    if (Math.sign(offset) === -1) {
      operator = '>=';
      order = 'ASC';
      // Technically the first negative offset should go back to zero.
      // Calculating the offset from the limit will keep a consistent offset count
      const positiveOffset = Math.abs(offset);
      offset = positiveOffset < limit ? 0 : positiveOffset - limit;
    }

    return  Message.query(this.connection)
    .from((builder) => {
      builder
        .as('m2')
        .from('messages as m1')
        .where('m1.organization_id', organization)
        .andWhere('m1.conversation_id', conversationId)
        .andWhere((qb) => {
          // Add for backwards compatibility
          if (date) {
            qb.where('m1.created_at', operator, date)
              .orWhere('m1.updated_at', operator, date);
          }
        })
        .orderBy('m1.created_at', order)
        .modify((b) => {
          // If no limit was sent, return all messages
          if (limit > 0) {
            b.limit(limit);
          }

          return b;
        })
        .offset(offset);
      })
      .orderBy('m2.created_at', 'ASC');
  }

  // For explanations on the duplicate signatures, see the comment at the top of
  // this file.
  public readonly findMediaMessagesBetweenDates = (
    organization: string,
    startDate: Date,
    endDate: Date,
    direction: DirectionType,
    phoneNumbers: Array<number>,
  ) =>
    this.getBillableUnitsQuery(organization, startDate, endDate, direction, phoneNumbers)
      .where(builder => builder
        .whereNotNull('media')
        .andWhere('media', '!=', '[]')
      )
      .andWhere('type', MessageType.USER) as any as Promise<Array<IUsageDetails>>

  public readonly findSMSBetweenDates = (
    organization: string,
    startDate: Date,
    endDate: Date,
    direction: DirectionType,
    phoneNumbers: Array<number>,
  ) =>
  this.getBillableUnitsQuery(organization, startDate, endDate, direction, phoneNumbers)
      .where(builder => builder
        .whereNull('media')
        .orWhere('media', '[]')
      )
      .andWhere('type', MessageType.USER) as any as Promise<Array<IUsageDetails>>

  public readonly findCallsBetweenDates = (
    organization: string,
    startDate: Date,
    endDate: Date,
    direction: DirectionType,
    phoneNumbers: Array<number>,
  ) =>
    this.getBillableUnitsQuery(organization, startDate, endDate, direction, phoneNumbers)
      .where('type', MessageType.CALL) as any as Promise<Array<IUsageDetails>>

  private getBillableUnitsQuery = (organization: string, startDate: Date, endDate: Date, direction = DirectionType.BOTH, phoneNumbers: Array<number> = []) => {
    this.connect();

    return getBillableUnitsQueryBuilder(this.connection)([organization], startDate, endDate)
      .groupBy('date')
      .modify((builder) => {
        const phoneNumbersJoined = phoneNumbers.join(',');
        // Knex was constructing the query incorrectly, so we must modify the query to build it correctly
        // Because this query is used as the base for several more specific queries, other WHERE clauses
        // are chained to it afterwards. The "modify" method here must use parenthetical precedence,
        // otherwise chained AND clauses after this point will not evaluate correctly.
        //
        // Knex composes this as (1 AND 2) OR (3 AND 4) rather than 1 AND (2 OR 3) AND 4.
        // The parentheses fix this.
        phoneNumbers.length && builder.whereRaw(`(to_phone_id IN (?) OR from_phone_id IN (?))`, [phoneNumbersJoined, phoneNumbersJoined]);

        direction !== DirectionType.BOTH && builder.where('direction', direction);
      });
  }
}
