import * as lambda from '../../../../lib/lambda++';
import { getOrganizationFromToken } from '../../../../core/auth';
import { Context } from '../context';
import { Conversation, Message, PhoneNumber, User } from '../models';

export const isAuthedResolver = (resolver: any) => async (
  obj: any,
  args: any,
  ctx: Context,
  info: any,
) => {
  // If we are offline or in the test stage, do not attempt to decode
  // an organization ID from an access token. Instead, look for an HTTP
  // header organization_id and use that value.
  if (ctx.Context.headers.organization_id && (process.env.IS_OFFLINE || process.env.STAGE === 'test')) {
    ctx.Context.state.organization = ctx.Context.headers.organization_id;
  } else {
    let accessToken: string = ctx.Context.headers.authorization;
    if (accessToken && !accessToken.startsWith('Basic ')) {
      accessToken = lambda.parseToken(ctx.Context.headers);
    }

    const organization = await getOrganizationFromToken(accessToken);
    ctx.Context.state.organization = organization;
  }

  return resolver(obj, args, ctx, info);
};

export const readPermissions = (organization: string, list: any[]) =>
  list.filter(l => l.organization_id && l.organization_id === organization);

export const canView = (
  organization: string,
  record: Conversation | Message | PhoneNumber | User,
) => {
  if (record && record.organization_id && organization === record.organization_id) {
    return record;
  }
  return null;
};
