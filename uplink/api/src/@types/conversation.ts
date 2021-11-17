import { Conversation } from '../models';

export interface IConversationMessageAttributes {
  messageCount?: number;
  offset?: number;
}

export interface IConversationLoader extends Conversation, IConversationMessageAttributes {
  finalDate?: string;
}