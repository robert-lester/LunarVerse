import moment from 'moment';

import { MessagesActionTypes, MessagesAction } from '../actions';
import { DateRange } from '../apollo/types';
import { Sort } from '../types';

export enum ContactNumberType {
  UPLINK = 'uplink',
  REAL = 'real'
}

export interface MessagesState {
  readonly selectedUserNumbers: string[];
  readonly dateRange: DateRange;
  readonly sort: Sort;
  readonly selectedConversationId: string | null;
  readonly conversationView: string;
  readonly selectedContactNumberType: ContactNumberType;
}

export const messagesReducerInitialState: MessagesState = {
  dateRange: {
    initial: moment().subtract(1, 'month').startOf('day'),
    final: moment()
  },
  selectedUserNumbers: [],
  sort: Sort.ASC,
  selectedConversationId: null,
  conversationView: 'all',
  selectedContactNumberType: ContactNumberType.REAL
};

/** REDUCER */

const messages = (
  state = messagesReducerInitialState,
  action: MessagesAction
) => {
  switch (action.type) {
    case MessagesActionTypes.SET_SELECTED_NUMBER:
      return {
        ...state,
        selectedUserNumbers: toggleSelectedNumber(action.payload as string, state.selectedUserNumbers)
      };
    case MessagesActionTypes.CLEAR_SELECTED_NUMBERS:
      return {
        ...state,
        selectedUserNumbers: []
      };
    case MessagesActionTypes.SET_SORT_TYPE:
      return {
        ...state,
        sort: action.payload
      };
    case MessagesActionTypes.SET_DATE_RANGE:
      return {
        ...state,
        dateRange: action.payload
      };
    case MessagesActionTypes.SET_SELECTED_CONVERSATION_ID:
      return {
        ...state,
        selectedConversationId: action.payload
      };
    case MessagesActionTypes.SET_CONVERSATION_VIEW:
      return {
        ...state,
        conversationView: action.payload
      };
    case MessagesActionTypes.SET_SELECTED_CONTACT_NUMBER_TYPE:
      return {
        ...state,
        selectedContactNumberType: action.payload
      };
    default:
      return state;
  }
};

/** CASE LOGIC REDUCTION */

/** Toggles the selected number */
function toggleSelectedNumber(userNumber: string, selectedUserNumbers: string[]) {
  // Removes id if it already exists
  if (selectedUserNumbers.includes(userNumber)) {
    return selectedUserNumbers.filter((selectedNumber: string) => selectedNumber !== userNumber);
  }
  return [...selectedUserNumbers, userNumber];
}

export default messages;