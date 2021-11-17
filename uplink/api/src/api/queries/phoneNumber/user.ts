import { Context } from '../../../context';
import { PhoneNumber, User } from '../../../models';

export default async (phoneNumber: PhoneNumber, _: any, ctx: Context): Promise<User> => {
    const result = await phoneNumber.user && ctx.DataLoaders.UserDataLoader.userById.load(phoneNumber.user_id);
    return result;
};
