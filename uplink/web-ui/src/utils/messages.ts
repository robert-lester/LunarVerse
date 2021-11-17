import { Message } from '../apollo/types';

/** Gets the count for media in a conversation */
export const getMediaCount = (messages: Message[]) => {
  return messages.reduce(
    (accumulator: number, message) => {
      if (message.media.length) {
        return accumulator + 1;
      }
      return accumulator;
    },
    0
  );
};
