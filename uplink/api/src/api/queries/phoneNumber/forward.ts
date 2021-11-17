import { Context } from '../../../context';
import { PhoneNumber } from '../../../models';

export default async (phoneNumber: PhoneNumber, args: any, ctx: Context): Promise<PhoneNumber> =>
    phoneNumber.forward_id && ctx.DataLoaders.PhoneDataLoader.phoneById.load(phoneNumber.forward_id);
