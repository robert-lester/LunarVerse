import * as AWS from 'aws-sdk';
import { IPlanBase } from '../../uplink/api/src/@types';
export { PollingIntervalUnits } from '../../uplink/api/src/@types';

export interface DynamoDBUser {
  username: string;
  createdAt: number;
  email: string;
  groups: string[];
  name: string;
  updatedAt: number;
  permissions: any;
  resources: any;
  userPoolId: string;
}

export interface DynamoDBOrg {
  name: string;
  id: string;
  userPoolId: string;
  updatedAt: number;
  createdAt: number;
  shuttlePlan: any;
  integrationTokens: any;
  userPoolClientId: string;
  uplinkPlan: IPlanBase;
  disabled?: boolean
}

export interface CognitoUser extends AWS.CognitoIdentityServiceProvider.AdminGetUserResponse {
  name: string;
}

export type AdminCreateUser = AWS.CognitoIdentityServiceProvider.AdminCreateUserRequest;

export type AdminForgotPassword = AWS.CognitoIdentityServiceProvider.ForgotPasswordRequest;

export interface UserAttributes {
  name: string;
  groups?: string[];
}

export interface IOrgAdmin {
  email: string;
  name: string;
}

export interface IZuora {
  accountId: string;
  subscriptionId: string;
  orderId: string;
}

export interface IOrgAttributes {
  mfaRequired: boolean;
  primaryApplication: string;
  uplinkPlan: IPlanBase;
  uplinkUserNumbers: number;
  uplinkUserNumberAreaCode: number;
  zuora: IZuora;
}

export interface IOrg {
  name: string;
  admins: IOrgAdmin[];
  attributes: IOrgAttributes;
  fromZuora: boolean;
}

export interface IUserData {
  name: string;
  orgSlug: string;
  email: string;
}
