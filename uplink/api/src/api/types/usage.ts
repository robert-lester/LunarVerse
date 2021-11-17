export default /* GraphQL */ `
  type UsageBreakdown {
    count           : Int
    date            : Date
  }
  type TotalBreakdown {
    count           : Int
  }

  type TotalBreakdownByCategory {
    inBound               : TotalBreakdown
    outBound              : TotalBreakdown
    inBoundSMS            : TotalBreakdown
    inBoundMediaMessages  : TotalBreakdown
    outBoundSMS           : TotalBreakdown
    outBoundMediaMessages : TotalBreakdown
  }
  type TotalBreakdownByVoice {
    inBound         : TotalBreakdown
    outBound        : TotalBreakdown
  }
  type DailyMessageBreakdown {
    inBound                   : [UsageBreakdown]
    outBound                  : [UsageBreakdown]
    inBoundSMS                : [UsageBreakdown]
    inBoundMediaMessages      : [UsageBreakdown]
    outBoundSMS               : [UsageBreakdown]
    outBoundMediaMessages     : [UsageBreakdown]
  }
  type DailyVoiceBreakdown {
    inBound         : [UsageBreakdown]
    outBound        : [UsageBreakdown]
  }
  type Breakdown {
    message         : DailyMessageBreakdown
    voice           : DailyVoiceBreakdown
    phoneNumbers    : [UsageBreakdown]
  }

  type BreakdownByPhone {
    systemNumber    : PhoneString
    message         : DailyMessageBreakdown
    voice           : DailyVoiceBreakdown
    phoneNumbers    : [UsageBreakdown]
  }
  type TotalsBreakdown {
    message         : TotalBreakdownByCategory
    voice           : TotalBreakdownByVoice
    phoneNumbers    : TotalBreakdown
  }
  type Usage {
    usage           : Breakdown
    usageByPhone    : [BreakdownByPhone]
    totals          : TotalsBreakdown
  }

  extend type Query {
    # Get the usage by account ID
    getUsage(
      dateRange     : DateRange
      phoneNumbers  : [String]
    )               : Usage!
}
`;
