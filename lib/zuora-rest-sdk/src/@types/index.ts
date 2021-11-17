export interface ZuoraRESTSDKOptions {
  password: string;
  sandbox: boolean;
  username: string;
}

export interface ZuoraUsageRow {
  ACCOUNT_ID: string;
  UOM: string;
  QTY: number;
  STARTDATE: string;
  ENDDATE: string;
  SUBSCRIPTION_ID: string;
  CHARGE_ID: string;
  DESCRIPTION: string;
}