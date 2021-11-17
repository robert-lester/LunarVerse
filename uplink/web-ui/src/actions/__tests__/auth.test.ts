import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as authActions from '../auth';
import { AuthActionTypes } from "../auth";
import root from '../../reducers/root';
import { AuthTokenActionTypes } from '../authToken';

describe('Auth actions', () => {
  let mockStore;
  let store: MockStoreEnhanced;
  const payload = {
    email: '',
    orgSlug: '',
    password: '',
    session: '',
    confirmationCode: '',
    confirmPassword: ''
  };
  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(root.getState());
  });

  afterEach(() => {
    store.clearActions();
  });

  it('should create an action to set resend of MFA code to success', () => {
    expect(authActions.resendMFACodeSuccess().type).toEqual(AuthActionTypes.RESEND_MFA_CODE_SUCCESS)
  });

  it('should create an action to set resend of MFA code to error', () => {
    expect(authActions.resendMFACodeError().type).toEqual(AuthActionTypes.RESEND_MFA_CODE_ERROR)
  });

  it('should create an action to set resend of MFA code to loading', () => {
    expect(authActions.resendMFACodeLoading().type).toEqual(AuthActionTypes.RESEND_MFA_CODE_LOADING)
  });

  it('should create an action to set send reset password email to success', () => {
    expect(authActions.sendResetPasswordEmailSuccess().type).toEqual(AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_SUCCESS)
  });

  it('should create an action to set send reset password email to error', () => {
    expect(authActions.sendResetPasswordEmailError().type).toEqual(AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_ERROR)
  });

  it('should create an action to set send reset password email to loading', () => {
    expect(authActions.sendResetPasswordEmailLoading().type).toEqual(AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_LOADING)
  });

  it('should create an action to set authentication of user to success', () => {
    expect(authActions.authenticateUserSuccess().type).toEqual(AuthActionTypes.AUTHENTICATE_USER_SUCCESS)
  });

  it('should create an action to set authentication of user to error', () => {
    expect(authActions.authenticateUserError().type).toEqual(AuthActionTypes.AUTHENTICATE_USER_ERROR)
  });

  it('should create an action to set authentication of user to loading', () => {
    expect(authActions.authenticateUserLoading().type).toEqual(AuthActionTypes.AUTHENTICATE_USER_LOADING)
  });

  it('should create an action to set reset password to success', () => {
    expect(authActions.resetPasswordSuccess().type).toEqual(AuthActionTypes.RESET_PASSWORD_SUCCESS)
  });

  it('should create an action to set reset password to error', () => {
    expect(authActions.resetPasswordError().type).toEqual(AuthActionTypes.RESET_PASSWORD_ERROR)
  });

  it('should create an action to set reset password to loading', () => {
    expect(authActions.resetPasswordLoading().type).toEqual(AuthActionTypes.RESET_PASSWORD_LOADING)
  });

  it('should create an action to set register phone number to success', () => {
    expect(authActions.registerPhoneNumberSuccess().type).toEqual(AuthActionTypes.REGISTER_PHONE_NUMBER_SUCCESS)
  });

  it('should create an action to set register phone number to error', () => {
    expect(authActions.registerPhoneNumberError().type).toEqual(AuthActionTypes.REGISTER_PHONE_NUMBER_ERROR)
  });

  it('should create an action to set register phone number to loading', () => {
    expect(authActions.registerPhoneNumberLoading().type).toEqual(AuthActionTypes.REGISTER_PHONE_NUMBER_LOADING)
  });

  it('should create an action to set sign out', () => {
    expect(authActions.signOut().type).toEqual(AuthActionTypes.SIGN_OUT)
  });

  it('should dispatch actions for register phone number success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { numberRegistration: {} } }));
    // @ts-ignore
    return store.dispatch(authActions.registerPhoneNumber(payload)).then(() => {
      const expectedActions = [
        AuthActionTypes.REGISTER_PHONE_NUMBER_LOADING,
        AuthActionTypes.REGISTER_PHONE_NUMBER_SUCCESS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for register phone number error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { numberRegistration: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(authActions.registerPhoneNumber(payload)).then(() => {
      const expectedActions = [
        AuthActionTypes.REGISTER_PHONE_NUMBER_LOADING,
        AuthActionTypes.REGISTER_PHONE_NUMBER_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for reset password success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { passwordReset: {} } }));
    // @ts-ignore
    return store.dispatch(authActions.resetPassword(payload)).then(() => {
      const expectedActions = [
        AuthActionTypes.RESET_PASSWORD_LOADING,
        AuthActionTypes.RESET_PASSWORD_SUCCESS,
        AuthActionTypes.AUTHENTICATE_USER_LOADING
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for reset password error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { passwordReset: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(authActions.resetPassword(payload)).then(() => {
      const expectedActions = [
        AuthActionTypes.RESET_PASSWORD_LOADING,
        AuthActionTypes.AUTHENTICATE_USER_ERROR,
        AuthActionTypes.RESET_PASSWORD_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for authenticate user success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { tokenDetail: {} } }));
    // @ts-ignore
    return store.dispatch(authActions.authenticateUser(payload)).then(() => {
      const expectedActions = [
        AuthActionTypes.AUTHENTICATE_USER_LOADING,
        AuthActionTypes.AUTHENTICATE_USER_SUCCESS,
        AuthTokenActionTypes.REFRESH_AUTH_TOKEN_SUCCESS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for authenticate user error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { tokenDetail: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(authActions.authenticateUser(payload)).then(() => {
      const expectedActions = [
        AuthActionTypes.AUTHENTICATE_USER_LOADING,
        AuthActionTypes.AUTHENTICATE_USER_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for send reset password email success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { passwordRequest: {} } }));
    // @ts-ignore
    return store.dispatch(authActions.sendResetPasswordEmail(payload)).then(() => {
      const expectedActions = [
        AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_LOADING,
        AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_SUCCESS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for send reset password email error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { passwordRequest: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(authActions.sendResetPasswordEmail(payload)).then(() => {
      const expectedActions = [
        AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_LOADING,
        AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for resend MFA code success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { resendMFA: {} } }));
    // @ts-ignore
    return store.dispatch(authActions.resendMFACode(payload)).then(() => {
      const expectedActions = [
        AuthActionTypes.RESEND_MFA_CODE_LOADING,
        AuthActionTypes.RESEND_MFA_CODE_SUCCESS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for resend MFA code error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { resendMFA: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(authActions.resendMFACode(payload)).then(() => {
      const expectedActions = [
        AuthActionTypes.RESEND_MFA_CODE_LOADING,
        AuthActionTypes.RESEND_MFA_CODE_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });
});