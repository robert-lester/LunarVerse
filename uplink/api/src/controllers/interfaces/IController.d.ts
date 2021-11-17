import * as Knex from 'knex';
import { Context, ServicesContext } from '../../context';
import * as NosQL from '../../../../../lib/nos-ql';

export interface IController {
  connection?: Knex;
  nosql?: NosQL;
  services?: ServicesContext;
  ctx?: Context;
  connect?(): boolean;
}
