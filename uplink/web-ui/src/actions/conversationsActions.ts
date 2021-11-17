import { Action } from 'redux';
import moment from 'moment';

import client from '../apollo/apolloClient';
import renderFeedback from '../apollo/feedback';
import { GetConversationsVariables, ConversationData } from '../apollo/types';
import { MessagesMessaging } from '../constants/messaging';
import { NotificationType } from '../components';
import { ThunkResult } from '../types';
import { clearConversationData } from './conversationActions';
import { getConversationsQuery } from '../apollo/queries';
import { setSelectedConversationId } from './messages';

/** TYPES */

export interface ConversationsAction extends Action {
  type: ConversationsActionTypes;
  payload?: GetConversationsVariables | ConversationData[];
}

export enum ConversationsActionTypes {
  GET_CONVERSATIONS_DATA_SUCCESS = 'GET_CONVERSATIONS_DATA_SUCCESS',
  GET_CONVERSATIONS_DATA_LOADING = 'GET_CONVERSATIONS_DATA_LOADING',
  GET_CONVERSATIONS_DATA_ERROR = 'GET_CONVERSATIONS_DATA_ERROR'
}

/** ACTIONS */

/** Get conversations loading state */
export const getConversationsDataLoading = (): ConversationsAction => ({
  type: ConversationsActionTypes.GET_CONVERSATIONS_DATA_LOADING
});

/** Get conversations error state */
export const getConversationsDataError = (): ConversationsAction => ({
  type: ConversationsActionTypes.GET_CONVERSATIONS_DATA_ERROR
});

/** Get conversations success state */
export const getConversationsDataSuccess = (payload: ConversationData[]): ConversationsAction => ({
  type: ConversationsActionTypes.GET_CONVERSATIONS_DATA_SUCCESS,
  payload
});

/** Get conversations, allows for specified numbers or uses store numbers */
export const getConversationsData = (specifiedUserNumbers?: string[]): ThunkResult<ConversationData[]> => {
  return async (dispatch, state) => {
    dispatch(getConversationsDataLoading());
    dispatch(clearConversationData());
    dispatch(setSelectedConversationId(null));
    const messagesState = state().messages;
    let final = messagesState.dateRange.final;
    // Set the final date to now to get most up to date result for current date
    if (messagesState.dateRange.final && messagesState.dateRange.final.isSame(moment(), 'day')) {
      final = moment();
    }
    return client.query({
      query: getConversationsQuery,
      variables: {
        selectedNumbers: specifiedUserNumbers || messagesState.selectedUserNumbers,
        dateRange: {
          ...messagesState.dateRange,
          final
        },
        sort: messagesState.sort
      }
    }).then(
      ({ data }) =>
        dispatch(getConversationsDataSuccess(data.getConversations)),
      () => {
        dispatch(getConversationsDataError());
        renderFeedback([{
          message: MessagesMessaging.GET_CONVERSATIONS_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};