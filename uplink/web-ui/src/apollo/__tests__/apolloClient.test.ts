import { errorhandler, headersHandler } from '../apolloClient';

describe('Apollo client', () => {
  beforeEach(() => {
    sessionStorage.uplinkAuthenticated = false;
    sessionStorage.uplinkAuth = false;
  })

  it('should clear sessionStorage on network error', () => {
    const div = document.createElement('DIV');
    const error = {
      networkError: new Error('Failed to fetch'),
      operation: '',
      forward: ''
    };
    div.id = 'notifications';
    document.body.appendChild(div);
    sessionStorage.uplinkAuthenticated = false;
    // @ts-ignore
    errorhandler(error);
    expect(sessionStorage.uplinkAuthenticated).toBeUndefined();
  });

  it('should not clear sessionStorage if desired network error does not occur', () => {
    const error = {
      networkError: new Error(''),
      operation: '',
      forward: ''
    };
    // @ts-ignore
    errorhandler(error);
    expect(sessionStorage.uplinkAuthenticated).toEqual('false');
  });

  it('should return Basic token', () => {
    sessionStorage.uplinkAuthenticated = true;
    const headers = headersHandler({ query: ''}, {});
    const expectedHeaders = {
      headers: {
        authorization: 'Basic false'
      }
    }
    expect(headers).toEqual(expectedHeaders);
  });

  it('should return token', () => {
    const headers = headersHandler({ query: ''}, {});
    const expectedHeaders = {
      headers: {
        authorization: 'false'
      }
    }
    expect(headers).toEqual(expectedHeaders);
  });
});