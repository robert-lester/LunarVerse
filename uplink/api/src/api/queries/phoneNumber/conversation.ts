import { Context } from '../../../context';
import { Conversation, PhoneNumber } from '../../../models';
import { DateFilters, SortOptions } from '../../../@types';
import { withinDateRange, sameDay } from '../../../lib/mapping';

export default async (
  phoneNumber: PhoneNumber,
  args: { filter?: DateFilters; sort?: SortOptions },
  ctx: Context,
): Promise<Conversation[]> => {
  let { conversations } = phoneNumber;
  conversations = await ctx.DataLoaders.ConversationDataLoader.conversationById.loadMany(
    conversations.map(c => c.id),
  );

  if (args.filter) {
    if (args.filter.date) {
      conversations = conversations.filter(c =>
        sameDay(new Date(c.updated_at).getTime(), new Date(args.filter.date).getTime()),
      );
    } else if (args.filter.dateRange) {
      const { initial, final } = args.filter.dateRange;
      conversations = conversations.filter(c =>
        withinDateRange(
          new Date(initial).getTime(),
          new Date(final).getTime(),
          new Date(c.updated_at).getTime(),
        ),
      );
    }
  }

  if (args.sort) {
    conversations = conversations.sort(
      (a, b) =>
        args.sort === SortOptions.ASC
          ? new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  }

  return conversations;
};
