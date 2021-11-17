import * as Knex from 'knex';
import * as Koa from 'koa';
import Logger from '../../lib/logger';
import Controller from '../api/controllers/Controller';

type NotFoundParams = {
  message: string;
};

export interface ApiOptions {
  withSources?: boolean;
  withDestinations?: boolean;
  withPods?: boolean;
  withTags?: boolean;
}

export interface PodApiOptions extends ApiOptions {
  current?: number;
  pageSize?: number;
  destinations?: Array<number>;
  sources?: Array<number>;
  errors?: boolean;
}

export interface IKoaContext<T = Controller> extends Koa.Context {
  db: Knex;
  logger: Logger;
  params: any;
  state: {
    body: any;
    controller: T;
    options?: any;
    organization: string;
  };
  notFound(obj: NotFoundParams): void;
}

export interface DomainParser {
  domain: string;
  subdomain: string;
  tld: string;
}
