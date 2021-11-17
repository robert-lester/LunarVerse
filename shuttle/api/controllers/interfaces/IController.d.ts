import * as Knex from 'knex';

export default interface IController {
  connection: Knex;
  connect(): boolean;
}
