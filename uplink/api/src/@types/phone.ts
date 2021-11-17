import { PhoneType } from './';
import { PhoneNumber } from '../models';

export interface IExternalPhoneNumber {
  external_phone_number?: string;
  toll_free?: boolean;
  area_code?: string;
  contains?: string;
  near_lat_long?: string;
  in_locality?: string;
  in_region?: string;
  in_lata?: string;
  in_postal_code?: string;
}

export interface IPhoneNumberAttributes {
  id?: number;
  sid?: string;
  notified?: boolean;
  physicalNumber?: string;
  organization_id?: string;
  messages?: string[];
  conversations?: string[];
  // TODO: Remove directDialNumber after it's been removed from the frontend
  directDialNumber?: string;
  type?: PhoneType;
  phonenumber_id?: PhoneNumber;
  user?: string;
  options?: IExternalPhoneNumber;
}

export interface IBatchCreatePhone {
  type: PhoneType;
  organization_id?: string;
  amount: number;
  options?: IExternalPhoneNumber;
}