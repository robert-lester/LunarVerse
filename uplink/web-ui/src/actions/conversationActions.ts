import { Action } from 'redux';
import moment from 'moment';

import client from '../apollo/apolloClient';
import renderFeedback from '../apollo/feedback';
import { ConversationData, GetConversationData, Message } from '../apollo/types';
import { MessagesMessaging } from '../constants/messaging';
import { NotificationType } from '../components';
import { ThunkResult } from '../types';
import { getConversationQuery } from '../apollo/queries';

/** TYPES */

export const LAZY_LOAD_OFFSET = 35;

export interface ConversationAction extends Action {
  type: ConversationActionTypes;
  payload?: ConversationData | null;
}

export enum ConversationActionTypes {
  CLEAR_CONVERSATION_DATA = 'CLEAR_CONVERSATION_DATA',
  GET_CONVERSATION_DATA_ERROR = 'GET_CONVERSATION_DATA_ERROR',
  GET_CONVERSATION_DATA_LOADING = 'GET_CONVERSATION_DATA_LOADING',
  GET_CONVERSATION_DATA_SUCCESS = 'GET_CONVERSATION_DATA_SUCCESS',
}

/** ACTIONS */

/** Set conversation loading state */
export const getConversationDataLoading = (): ConversationAction => ({
  type: ConversationActionTypes.GET_CONVERSATION_DATA_LOADING
});

/** Set conversation error state */
export const getConversationDataError = (): ConversationAction => ({
  type: ConversationActionTypes.GET_CONVERSATION_DATA_ERROR
});

/** Set conversation */
export const getConversationDataSuccess = (payload: ConversationData): ConversationAction => ({
  type: ConversationActionTypes.GET_CONVERSATION_DATA_SUCCESS,
  payload
});

/** Clear conversation data */
export const clearConversationData = (): ConversationAction => ({
  type: ConversationActionTypes.CLEAR_CONVERSATION_DATA
});

/** Get conversation */
export const getConversationData = (offset: number = 0): ThunkResult<ConversationData> => {
  // TODO: Readdress the time and array mutations to clean this up
  return async (dispatch, state) => {
    dispatch(getConversationDataLoading());
    let { selectedConversationId, dateRange: { final: finalDate } } = state().messages;
    const existingConversation = state().conversation.payload;
    const finalDateVariable = getFinalDate(existingConversation, selectedConversationId, finalDate, offset);
    return client.query<GetConversationData>({
      query: getConversationQuery,
      variables: {
        public_id: selectedConversationId,
        finalDate: finalDateVariable,
        attributes: {
          messageCount: LAZY_LOAD_OFFSET,
          offset: offset * LAZY_LOAD_OFFSET
        }
      },
      fetchPolicy: 'no-cache'
    }).then(
      ({ data }) => {
        // If new conversation
        if ((selectedConversationId && existingConversation && existingConversation.public_id !== selectedConversationId) || !existingConversation) {
          dispatch(getConversationDataSuccess(data.getConversation))
        } else if (existingConversation) {
          let conversation: ConversationData = parseConversationData(data.getConversation.messages, existingConversation, offset);
          dispatch(getConversationDataSuccess(conversation));
        }
      },
      () => {
        dispatch(getConversationDataError());
        renderFeedback([{
          message: MessagesMessaging.GET_CONVERSATION_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** ACTION LOGIC */

/** Dedupes existing conversation vs new conversation messages and concats the data */
export const parseConversationData = (newConversationMessages: Message[], existingConversation: ConversationData, offset: number) => {
  let existingMessages = existingConversation.messages;
  const newExistingMessages = deduplicateConversationMessages(existingMessages, newConversationMessages);
  // Fetching forwards
  // Take existing conversations and add new messages
  if (offset < 0) {
    // Remove dupes compared against existing nessages and new messages response
    return {
      ...existingConversation,
      messages: newExistingMessages.concat(newConversationMessages)
    }
  } else {
    // Remove dupes compared against existing nessages and new messages response
    return {
      ...existingConversation,
      messages: newConversationMessages.concat(newExistingMessages)
    }
  }
}

/** Checks against new conversation messages and existing message to remove duplicate messages */
export const deduplicateConversationMessages = (existingMessages: Message[], newMessages: Message[]) => {
  return existingMessages.filter(message => !newMessages.find(newMessage => newMessage.public_id === message.public_id));
}

/** Gets the final date for the data query based on current message dates and offset */
export const getFinalDate = (
  existingConversation: ConversationData | null,
  selectedConversationId: string | null,
  currentFinalDate: moment.Moment | null,
  offset: number
): string | null => {
  const isFetchingForExistingConversation = existingConversation && existingConversation.public_id === selectedConversationId;
  const isToday = currentFinalDate && moment(currentFinalDate).isSame(moment(), 'day');
  let finalDate;
  // Set the final date to now if fetching new conversation and is 'today'
  if (isToday && !isFetchingForExistingConversation) {
    finalDate = moment();
  }
  // If conversation messages exist and fetching for existing conversation
  if (isFetchingForExistingConversation && existingConversation && existingConversation.messages.length) {
    const existingConversationMessages = existingConversation.messages;
    // If fetching forwards and conversation messages exist, use last message's date
    if (offset < 0) {
      finalDate = moment(existingConversationMessages[existingConversationMessages.length - 1].created_at);
    } else {
      // If fetching backwards and conversation exists, use first message's date
      finalDate = moment(existingConversationMessages[0].created_at);
    }
  }
  const gotFinalDate = finalDate || currentFinalDate;
  return gotFinalDate && gotFinalDate.format('YYYY-MM-DDTHH:mm:ss.sssZ');
}
