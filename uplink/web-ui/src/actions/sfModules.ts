import { Action } from 'redux';
import { ApolloQueryResult } from 'apollo-client';
import { ThunkResult } from '../types';
import client from '../apollo/apolloClient';

import { startConversationMutation } from '../apollo/mutations';
import renderFeedback from '../apollo/feedback';
import { NotificationType } from '../components';
import { StartConversationMessaging, StartConversationServerErrorMessaging } from '../constants/messaging';
import { CreateContactData } from '../apollo/types';

export interface SfModulesAction extends Action {
  type: SfModulesActionTypes;
  payload?: CreateContactData;
}

export enum SfModulesActionTypes {
  START_CONVERSATION = 'START_CONVERSATION',
  START_CONVERSATION_LOADING = 'START_CONVERSATION_LOADING',
  START_CONVERSATION_SUCCESS = 'START_CONVERSATION_SUCCESS',
  START_CONVERSATION_ERROR = 'START_CONVERSATION_ERROR'
}

/** Start conversation loader */
export const startConversationLoading = (): SfModulesAction => ({
  type: SfModulesActionTypes.START_CONVERSATION_LOADING
});

/** Start conversation success message */
export const startConversationSuccess = (payload?: CreateContactData): SfModulesAction => ({
  type: SfModulesActionTypes.START_CONVERSATION_SUCCESS,
  payload
});

/** Start conversation error message */
export const startConversationError = (): SfModulesAction => ({
  type: SfModulesActionTypes.START_CONVERSATION_ERROR
});

/** Starts a conversation by looking at the session storage variables */
export const startConversation = (): ThunkResult<{}> => {
  return async (dispatch) => {
    dispatch(startConversationLoading());
    return client.mutate({
      mutation: startConversationMutation,
      variables: {
        contactRealNumber: sessionStorage.getItem('uplinkContactPhoneNumber'),
        userRealNumber: sessionStorage.getItem('uplinkUserPhoneNumber')
      }
    }).then(
      ({ data }: ApolloQueryResult<CreateContactData>) => {
        dispatch(startConversationSuccess(data));
        renderFeedback([{
          message: StartConversationMessaging.START_CONVERSATION_SUCCESS,
          type: NotificationType.SUCCESS
        }]);
      },
      (err) => {
        const errorMessageEnum = StartConversationServerErrorMessaging[err.message];

        dispatch(startConversationError());
        renderFeedback([{
          message: StartConversationMessaging[errorMessageEnum] || StartConversationMessaging.START_CONVERSATION_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};