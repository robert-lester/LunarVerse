import { APIGatewayProxyResult } from 'aws-lambda';
import * as Koa from 'koa';

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  charset: 'utf-8',
  'content-type': 'application/json',
};

const DEFAULT_TWILIO_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  charset: 'utf-8',
  'content-type': 'text/xml',
};

const setHeaders = (ctx: Koa.Context, headers: any): void => {
  Object.keys(headers).forEach(k => {
    ctx.set(k, headers[k]);
  });
};

export const twilioSuccess = (ctx: Koa.Context, message?: string): void => {
  ctx.status = 200;
  setHeaders(ctx, DEFAULT_TWILIO_HEADERS);
  // https://www.twilio.com/docs/voice/twiml#responding-to-twilio
  ctx.body = message || '<Response/>';
};

export const twilioBadRequest = (ctx: Koa.Context, message?: string): void => {
  ctx.status = 400;
  setHeaders(ctx, DEFAULT_TWILIO_HEADERS);
  ctx.body = message || 'The request was invalid';
};

export const twilioError = (ctx: Koa.Context, data: string): void => {
  ctx.status = 500;
  setHeaders(ctx, DEFAULT_TWILIO_HEADERS);
  ctx.body = data;
};

export const success = (data: any): APIGatewayProxyResult => ({
  statusCode: 200,
  headers: DEFAULT_HEADERS,
  body: JSON.stringify(data),
});
