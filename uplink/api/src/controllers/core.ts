import * as Knex from 'knex';
import { IController } from './interfaces';
import { Context, ServicesContext } from '../context';
import * as NosQL from '../../../../lib/nos-ql';

export abstract class CoreController implements IController {
  public connection: Knex;
  public nosql?: NosQL;
  public services?: ServicesContext;
  public ctx?: Context;

  /**
   * Initialize controller object
   * @param connection Knex connection object in Awilix cradle
   */
  constructor(connection: Knex, params: IController = {} as IController) {
    // You may ask what the hell is going on here? See stack overflow.
    // https://stackoverflow.com/questions/12702548/constructor-overload-in-typescript
    const {
      nosql = null,
      services = null,
      ctx = null,
    } = params;

    this.connection = connection;
    this.nosql = nosql;
    this.services = services;
    this.ctx = ctx;
  }

  /**
   * Validates the existing knex connection to the Database and throws an error if there is no connection
   * @throws Error
   */
  public connect(): boolean {
    if (this.connection) {
      return true;
    }
    throw new Error('There is no connection to the database! Please contact your administrator');
  }
}
