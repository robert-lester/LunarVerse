import { ConversationActionTypes, ConversationAction } from '../actions';
import { ConversationData } from '../apollo/types';

/** TYPES */

export interface ConversationState {
  readonly payload: ConversationData | null;
  readonly isLoading: boolean;
}

export const conversationReducerInitialState: ConversationState = {
  payload: null,
  isLoading: false
};

/** REDUCER */

const conversationReducer = (
  state = conversationReducerInitialState,
  action: ConversationAction
) => {
  switch (action.type) {
    case ConversationActionTypes.GET_CONVERSATION_DATA_SUCCESS:
      return {
        ...state,
        payload: action.payload,
        isLoading: false
      };
    case ConversationActionTypes.GET_CONVERSATION_DATA_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case ConversationActionTypes.GET_CONVERSATION_DATA_ERROR:
      return {
        ...state,
        isLoading: false
      };
    case ConversationActionTypes.CLEAR_CONVERSATION_DATA:
      return {
        ...state,
        payload: null
      };
    default:
      return state;
  }
};

export default conversationReducer;