import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { Dispatch } from 'redux';

import { AssignNumbersState } from '../reducers/assignNumbers';
import { AuthState } from '../reducers/auth';
import { AuthTokenState } from '../reducers/authToken';
import { ConversationState } from '../reducers/conversationReducer';
import { ConversationsState } from '../reducers/conversationsReducer';
import { MessagesState, UsersState, ActivityState, PlanState, UserState, UserNumbersState, SfModulesState, IntegrationSettingsState } from '../reducers';
import { URLTokenState } from '../reducers/urlToken';
import { UserAction, UsersAction, ActivityAction, MessagesAction, PlanAction, AssignNumbersAction, UserNumbersAction, AuthAction, SfModulesAction, URLTokenAction, AuthTokenAction, ConversationAction, ConversationsAction, IntegrationSettingsAction } from '../actions';

/** Global App State */
export interface GlobalState {
  activity: ActivityState;
  assignNumbers: AssignNumbersState;
  auth: AuthState;
  authToken: AuthTokenState;
  conversation: ConversationState;
  conversations: ConversationsState;
  messages: MessagesState;
  plan: PlanState;
  integrationSettings: IntegrationSettingsState;
  sfModules: SfModulesState;
  urlToken: URLTokenState;
  user: UserState;
  userNumbers: UserNumbersState;
  users: UsersState;
}

/** Global App Actions */
export type GlobalActions =
  ActivityAction |
  AssignNumbersAction |
  AuthAction |
  AuthTokenAction |
  ConversationAction |
  ConversationsAction |
  MessagesAction |
  PlanAction |
  IntegrationSettingsAction |
  SfModulesAction |
  URLTokenAction |
  UserAction |
  UserNumbersAction |
  UsersAction;

/** Global Thunk */
export type ThunkResult<R> = ThunkAction<Promise<GlobalActions | void>, GlobalState, null, GlobalActions>;

export type ThunkDispatcher = ThunkDispatch<GlobalState, null, GlobalActions> & Dispatch;

/** Global General */
export enum Sort {
  ASC = 'ASC',
  DESC = 'DESC'
}

/** NodeJS Global */
export interface Global extends NodeJS.Global {
  document: Document;
  window: Window;
}