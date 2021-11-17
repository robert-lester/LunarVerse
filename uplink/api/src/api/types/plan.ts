export default /* GraphQL */ `
  type BasePlan {
    billingCycle   : String @deprecated(reason: "Not dynamic, will come from Zuora")
    billingStartDate : String
    displayName    : String @deprecated(reason: "Not dynamic, will come from Zuora")
  }

  type PlanUsage {
    mediaMessages  : Int
    smsMessages    : Int
    userNumbers    : Int
    voiceMinutes   : Int
  }

  type UsageCycle {
    startDate      : String
    endDate        : String
  }

  type Numbers {
    included       : Int
    used           : Int
  }

  type Plan {
    base           : BasePlan!
    billingCycle   : String @deprecated(reason: "Not dynamic, will come from Zuora")
    name           : String
    numbers        : Numbers!
    sfToken        : String
    usage          : PlanUsage!
    usageCycle     : UsageCycle!
  }

  extend type Query {
    # Get the billing activity
    getPlan         : Plan!
}
`;
