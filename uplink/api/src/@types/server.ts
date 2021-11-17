import * as Knex from 'knex';
import * as Koa from 'koa';
import Logger from '../../../../lib/logger';
import * as NosQL from '../../../../lib/nos-ql';
import { LockService } from './';

export interface IKoaContext extends Koa.Context {
  db?: Knex;
  locks?: LockService;
  logger?: Logger;
  nosql?: NosQL;
}

export interface IntegrationTokens {
  [key: string]: {
    value: string;
  };
}
