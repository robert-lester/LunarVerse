import { DataLoadersContext } from './DataLoadersContext';
import { ServicesContext } from './ServicesContext';
import { IKoaContext } from '../@types';
import * as Knex from 'knex';

export class Context {
  public DataLoaders: DataLoadersContext;
  public Services: ServicesContext;
  constructor(private ctx: IKoaContext) {
    this.DataLoaders = new DataLoadersContext(ctx.db);
    this.Services = new ServicesContext(ctx.db, ctx.nosql, this);
  }

  public get Context(): IKoaContext {
    return this.ctx;
  }

  public get db(): Knex {
    return this.ctx.db;
  }

  public get locks() {
    return this.ctx.locks;
  }

  public get nosql() {
    return this.ctx.nosql;
  }

  public get organization(): string {
    if (!this.ctx.state.organization || (this.ctx.state.organization && this.ctx.state.organization.length === 0)) {
      throw new ReferenceError(`Organization is not defined`);
    }
    return this.ctx.state.organization;
  }

  public set organization(orgName: string) {
    this.ctx.state.organization = orgName;
  }
}
