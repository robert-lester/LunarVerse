import { twilioError, twilioSuccess } from '../lib/response';
import { Context } from '../context';
import { IKoaContext, ITwilioMessageRequest, } from '../@types';
import { IntakeControllerResponse } from '../controllers/intake';
import { IntakeResponses } from '../@types';
/**
 * `SMS` handler
 *
 * Handles all incoming texts into system numbers
 *
 * Determines the destination number type to route the request
 * Contact/User type: find destination user and find/create a conversation between the 2 users
 * store message contents and route message to destination user from contact's system number
 * @param ctx An instance of the application context; includes Services/DataLoaders
 */
export const text = async (ctx: Context): Promise<any> => {
  const koa: IKoaContext = ctx.Context;
  const twilioMessageRequest: ITwilioMessageRequest = koa.request.body;
  const result: IntakeControllerResponse = await ctx.Services.IntakeService.sendText(twilioMessageRequest);

  if (result.rawMessage !== IntakeResponses.SUCCESS) {
    return twilioError(koa, result.message);
  }

  return twilioSuccess(koa);
};