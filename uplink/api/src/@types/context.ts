import * as DataLoader from 'dataloader';
import { Conversation, Message, PhoneNumber, User } from '../models';

export interface IConversationDataLoader {
  conversationById: DataLoader<number, Conversation>;
  conversationByPhoneNumber: DataLoader<number, any>;
}

export interface IMessageDataLoader {
  messageById: DataLoader<number, Message>;
}

export interface IPhoneDataLoader {
  phoneById: DataLoader<number, PhoneNumber>;
  phoneByUser: DataLoader<number, PhoneNumber>;
}

export interface IUserDataLoader {
  userById: DataLoader<number, User>;
  userByPhoneNumber: DataLoader<number, User>;
}
