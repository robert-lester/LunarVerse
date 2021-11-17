import { Context } from '../../../context';
import { Organization } from '../../../@types';
import { ResourceNotFound } from '../../exceptions/ResourceNotFound';

export default (_: any, args: { fields: Partial<Organization> & { slug: string } }, ctx: Context) => {
  if (ctx.Context.state.organization !== args.fields.slug) {
    throw new ResourceNotFound('');
  }
  return ctx.Services.OrganizationService.updateDeeply(args.fields);
};