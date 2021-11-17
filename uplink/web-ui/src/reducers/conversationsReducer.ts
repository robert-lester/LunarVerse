import { ConversationsActionTypes, ConversationsAction } from '../actions';
import { ConversationData } from '../apollo/types';

export interface ConversationsState {
  readonly payload: ConversationData[];
  readonly isLoading: boolean;
}

export const conversationsReducerInitialState: ConversationsState = {
  payload: [],
  isLoading: false
};

/** REDUCER */

const conversationsReducer = (
  state = conversationsReducerInitialState,
  action: ConversationsAction
) => {
  switch (action.type) {
    case ConversationsActionTypes.GET_CONVERSATIONS_DATA_SUCCESS:
      return {
        ...state,
        payload: action.payload,
        isLoading: false
      };
    case ConversationsActionTypes.GET_CONVERSATIONS_DATA_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case ConversationsActionTypes.GET_CONVERSATIONS_DATA_ERROR:
      return {
        ...state,
        isLoading: false
      };
    default:
      return state;
  }
};

export default conversationsReducer;