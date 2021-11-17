import { Context } from '../../../context';
import { IntakeControllerResponse } from '../../../controllers/intake';
import {
    ITwilioMessageRequest,
    Origin,
    IntakeResponses
} from '../../../@types';
import { IntakeError } from '../../exceptions/IntakeError';

export default async (_: any, request: any, ctx: Context): Promise<any> => {
    const { To, From, Body, NumMedia = 0 } = request.fields;

    const twilioMessageRequest: ITwilioMessageRequest = { To, From, Body, NumMedia };
    const result: IntakeControllerResponse = await ctx.Services.IntakeService.sendText(twilioMessageRequest, Origin.WEB);

    if (result.rawMessage !== IntakeResponses.SUCCESS) {
        const { message, code } = result;
        throw new IntakeError(message, code);
    }

    return Promise.resolve({ To, From, Body, NumMedia });
};