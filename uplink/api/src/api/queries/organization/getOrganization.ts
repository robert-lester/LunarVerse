import { Context } from '../../../context';
import { ResourceNotFound } from '../../exceptions/ResourceNotFound';

export default async (_, args: { slug: string }, ctx: Context) => {
  if (ctx.Context.state.organization !== args.slug) {
    throw new ResourceNotFound('');
  }
  const organization = await ctx.Services.OrganizationService.read(args.slug);

  if (organization === null) {
    throw new ResourceNotFound('');
  }
  return organization;
};