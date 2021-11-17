import { UserType } from './';

export interface IUserAttributes {
  id?: number;
  isUser?: boolean;
  organization_id?: string;
  type?: UserType;
  phoneNumber?: string;
  systemPhoneNumbers?: string[];
  name?: string;
  // TODO: Remove directDialNumber after it's been removed from the frontend
  directDialNumber?: string;
}

export interface IActivity {
  id?: number;
  firstInBound?: Date;
  firstOutBound?: Date;
  lastInBound?: Date;
  lastOutBound?: Date;
  status?: string;
  systemNumber?: string;
}
