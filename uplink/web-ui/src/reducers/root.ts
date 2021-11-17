import thunk from 'redux-thunk';
import { combineReducers, ReducersMapObject, createStore, applyMiddleware } from 'redux';

import activity from './activity';
import assignNumbers from './assignNumbers';
import auth from './auth';
import authToken from './authToken';
import messages from './messages';
import plan from './plan';
import integrationSettings from './integrationSettings';
import sfModules from './sfModules';
import urlToken from './urlToken';
import user from './user';
import userNumbers from './userNumbers';
import users from './users';
import { GlobalState, GlobalActions } from '../types';
import { UserActionTypes } from '../actions';
import { default as conversation } from './conversationReducer';
import { default as conversations } from './conversationsReducer';

const appReducer = combineReducers<GlobalState>({
  activity,
  assignNumbers,
  auth,
  authToken,
  conversation,
  conversations,
  messages,
  plan,
  integrationSettings,
  sfModules,
  urlToken,
  user,
  userNumbers,
  users
} as ReducersMapObject);

const rootReducer = (state: GlobalState | undefined, action: GlobalActions) => {
  if (action.type === UserActionTypes.SIGN_OUT) {
    state = undefined;
  }
  return appReducer(state, action);
};

export default createStore(rootReducer, applyMiddleware(thunk));