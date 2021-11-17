import * as Knex from 'knex';
import * as MySQL from 'mysql';

import { IController } from './interfaces';
import { DatabaseConnectionException } from '../../exceptions';

abstract class Controller implements IController {
  public connection: Knex;

  /**
   * Initialize controller object
   * @param connection Knex connection object in Awilix cradle
   */
  constructor(connection: Knex) {
    this.connection = connection;
  }

  /**
   * Validates the existing knex connection to the Database and throws an error if there is no connection
   * @throws DatabaseConnectionException
   */
  public connect(): boolean {
    if (this.connection) {
      return true;
    }
    throw new DatabaseConnectionException(
      'There is no connection to the database! Please contact your administrator',
    );
  }

  /**
   * Close the database connection for the controller
   */
  public closeConnection() {
    console.info('Closing connection...');
    this.connection.destroy(() => {
      console.info('Connection closed.');
    });
  }
}

export default Controller;
