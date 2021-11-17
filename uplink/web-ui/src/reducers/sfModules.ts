import { SfModulesAction, SfModulesActionTypes } from '../actions';

export interface SfModulesState {
  readonly isStartConversationLoading: boolean;
  readonly systemNumber: string;
}

export const sfModulesReducerInitialState: SfModulesState = {
  isStartConversationLoading: false,
  systemNumber: ''
};

const startConversation = (
  state = sfModulesReducerInitialState,
  action: SfModulesAction
) => {
  switch (action.type) {
    case SfModulesActionTypes.START_CONVERSATION_LOADING:
      return {
        ...state,
        isStartConversationLoading: true
      };
    case SfModulesActionTypes.START_CONVERSATION_SUCCESS:
      return {
        ...state,
        isStartConversationLoading: false,
        systemNumber: action.payload!.createContact.systemNumber
      };
    case SfModulesActionTypes.START_CONVERSATION_ERROR:
      return {
        ...state,
        isStartConversationLoading: false
      };
    default:
      return state;
  }
};

export default startConversation;