import { Action } from 'redux';

import { ContactNumberType } from '../reducers';
import { DateRange } from '../apollo/types';
import { Sort } from '../types';

/** TYPES */

export interface MessagesAction extends Action {
  type: MessagesActionTypes;
  payload?: DateRange | string | number | null;
}

export enum MessagesActionTypes {
  SET_CONVERSATION_VIEW = 'SET_CONVERSATION_VIEW',
  SET_SELECTED_CONVERSATION_ID = 'SET_SELECTED_CONVERSATION_ID',
  SET_SELECTED_NUMBER = 'SET_SELECTED_NUMBER',
  SET_DATE_RANGE = 'SET_DATE_RANGE',
  SET_SORT_TYPE = 'SET_SORT_TYPE',
  CLEAR_SELECTED_NUMBERS = 'CLEAR_SELECTED_NUMBERS',
  SET_SELECTED_CONTACT_NUMBER_TYPE = 'SET_SELECTED_CONTACT_NUMBER_TYPE'
}

/** ACTIONS */

/** Set selected numbers */
export const setMessagesSelectedNumber = (payload: string): MessagesAction => ({
  type: MessagesActionTypes.SET_SELECTED_NUMBER,
  payload
});

/** Clear selected numbers */
export const clearMessagesSelectedNumber = (): MessagesAction => ({
  type: MessagesActionTypes.CLEAR_SELECTED_NUMBERS
});

/** Set selected Contact Number type */
export const setSelectedContactNumberType = (payload: ContactNumberType): MessagesAction => ({
  type: MessagesActionTypes.SET_SELECTED_CONTACT_NUMBER_TYPE,
  payload
});

/** Set date range */
export const setMessagesDateRange = (payload: DateRange): MessagesAction => ({
  type: MessagesActionTypes.SET_DATE_RANGE,
  payload
});

/** Set selected conversation */
export const setSelectedConversationId = (payload: string | null): MessagesAction => ({
  type: MessagesActionTypes.SET_SELECTED_CONVERSATION_ID,
  payload
});

export const setConversationView = (payload: string): MessagesAction => ({
  type: MessagesActionTypes.SET_CONVERSATION_VIEW,
  payload
});

/** Set sort type */
export const setSortType = (payload: Sort): MessagesAction => ({
  type: MessagesActionTypes.SET_SORT_TYPE,
  payload
});