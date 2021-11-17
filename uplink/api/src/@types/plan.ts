export enum BillingCycles {
  ANNUALLY = 'annually',
  MONTHLY = 'monthly',
}

export interface IPlanBase {
  billingCycle: BillingCycles;
  billingStartDate: string;
  displayName: string;
}

export interface IPlan {
  base: IPlanBase;
  billingCycle: BillingCycles;
  name: string;
  numbers: {
    included: number;
    used: number;
  };
  sfToken: string;
  usage: {
    mediaMessages: number;
    smsMessages: number;
    voiceMinutes: number;
  };
  usageCycle: {
    startDate: string;
    endDate: string;
  };
}
