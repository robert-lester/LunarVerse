import { expect } from 'chai';
import {
  twilioSuccess,
  twilioBadRequest,
  twilioError,
  success,
} from '../../../src/lib/response';

describe('lib/response', () => {
  const ctx = {
    set: (field, val) => ({
      field: val,
    }),
    status: 0,
    body: '',
  };
  it('sets the ctx with a status of 200 and body a custom message on success', () => {
    twilioSuccess(ctx as any, 'Message');
    console.log(ctx.set);
    expect(ctx.status).to.equal(200);
    expect(ctx.body).to.equal('Message');
  });
  it('sets the ctx with a status of 200 and body a default error message on success', () => {
    twilioSuccess(ctx as any);
    expect(ctx.status).to.equal(200);
    expect(ctx.body).to.equal('<Response/>');
  });
  it('sets the ctx with a status of 400 and body a custom error message', () => {
    twilioBadRequest(ctx as any, 'Error');
    expect(ctx.status).to.equal(400);
    expect(ctx.body).to.equal('Error');
  });
  it('sets the ctx with a status of 400 and body a default error message', () => {
    twilioBadRequest(ctx as any);
    expect(ctx.status).to.equal(400);
    expect(ctx.body).to.equal('The request was invalid');
  });
  it('sets the ctx with a status of 500 and body a custom error message', () => {
    twilioError(ctx as any, 'Internal Server Error');
    expect(ctx.status).to.equal(500);
    expect(ctx.body).to.equal('Internal Server Error');
  });
});
