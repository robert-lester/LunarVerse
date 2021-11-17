export interface IUsageDetails {
  count: number;
  date: Date;
}

export interface IUsageTotals {
  count: number;
}

export interface IUsageByPhone {
  systemNumber: string;
  message: {
    inBound: IUsageDetails[];
    outBound: IUsageDetails[];
    inBoundSMS: IUsageDetails[];
    inBoundMediaMessages: IUsageDetails[];
    outBoundSMS: IUsageDetails[];
    outBoundMediaMessages: IUsageDetails[];
  };
  voice: {
    inBound: IUsageDetails[];
    outBound: IUsageDetails[];
  };
}

export interface IUsageBreakdown {
  message: {
    inBound: IUsageDetails[];
    outBound: IUsageDetails[];
    inBoundSMS: IUsageDetails[];
    inBoundMediaMessages: IUsageDetails[];
    outBoundSMS: IUsageDetails[];
    outBoundMediaMessages: IUsageDetails[];
  };
  voice: {
    inBound: IUsageDetails[];
    outBound: IUsageDetails[];
  };
}

export interface IUsage {
  usage: IUsageBreakdown;
  usageByPhone: IUsageByPhone[];
  totals: {
    message: {
      inBound: IUsageTotals;
      outBound: IUsageTotals;
      inBoundSMS: IUsageTotals;
      inBoundMediaMessages: IUsageTotals;
      outBoundSMS: IUsageTotals;
      outBoundMediaMessages: IUsageTotals;
    };
    voice: {
      inBound: IUsageTotals;
      outBound: IUsageTotals;
    };
  };
}
