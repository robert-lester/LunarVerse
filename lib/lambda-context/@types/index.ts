// NOTE: This @types file isn't ambient (.d.ts) because its types require dynamic subtype imports

import { APIGatewayProxyEvent, Context } from 'aws-lambda';

export interface BindOptions {
  includeSuccess: boolean;
}

export interface Controller<RequestType> {
  (req: RequestType): Promise<any>
}

export interface SimpleHandler {
  (event: APIGatewayProxyEvent, context: Context): any;
}