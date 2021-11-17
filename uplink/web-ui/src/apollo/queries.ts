import gql from 'graphql-tag';

/** USER NUMBERS */
export const getAllUserNumbersQuery = gql`
  {
    getPhoneNumbers(type: [UNASSIGNED, USER, FORWARD]) {
      id
      type
      callOrText30Days
      messages {
        public_id
      }
      systemNumber
      user {
        id
        name
        physicalNumber
        color
      }
      forward {
        type
        id
        systemNumber
      }
    }
  }
`;

export const getUnassignedUsersQuery = gql`
  {
    getUsers(assigned: false) {
      name
      id
      physicalNumber
      color
    }
  }
`;

export const getUsersQuery = gql`
  {
    getUsers {
      name
      id
      physicalNumber
      directDialNumber
      color
      phoneNumber {
        id
        systemNumber
      }
    }
  }
`;

export const getConversationsQuery = gql`
  query GetConversations($selectedNumbers: [String], $dateRange: DateRange, $sort: SortOptions) {
    getConversations(phoneNumbers: $selectedNumbers, filter: $dateRange, sort: $sort) {
      id
      public_id
      updated_at
      phoneNumbers {
        id
        systemNumber
        type
        user {
          id
          name
          physicalNumber
          color
        }
      }
    }
  }
`;

// TODO: Remove `id` visibility as soon as we can confirm that every customer has been updated to a compatible SF package version
export const getConversationQuery = gql`
  query GetConversation($public_id: String, $finalDate: String, $attributes: ConversationAttributes) {
    getConversation(public_id: $public_id, finalDate: $finalDate, attributes: $attributes) {
      id
      public_id
      finalDate
      offset
      messageCount
     phoneNumbers {
       id
       systemNumber
       type
       user {
         id
         name
         type
         physicalNumber
         color
       }
     }
     messages {
       public_id
       message
       media {
         url
         mime_type
       }
       duration
       created_at
       type
       sender {
         id
         name
         color
         type
       }
       phoneNumber {
         systemNumber
       }
     }
    }
  }
`;

export const getUsageQuery = gql`
  query GetUsage($dateRange: DateRange, $phoneNumbers: [String]) {
    getUsage(dateRange: $dateRange, phoneNumbers: $phoneNumbers) {
      usage {
        message {
          inBoundSMS {
            count
            date
          }
          inBoundMediaMessages {
            count
            date
          }
          outBoundSMS {
            count
            date
          }
          outBoundMediaMessages {
            count
            date
          }
        }
        voice {
          inBound {
            count
            date
          }
          outBound {
            count
            date
          }
        }
      }
      usageByPhone {
        systemNumber
        message {
          inBoundSMS {
            count
            date
          }
          inBoundMediaMessages {
            count
            date
          }
          outBoundSMS {
            count
            date
          }
          outBoundMediaMessages {
            count
            date
          }
        }
        voice {
          inBound {
            count
            date
          }
          outBound {
            count
            date
          }
        }
      }
      totals {
        message {
          inBoundSMS {
            count
          }
          outBoundSMS {
            count
          }
          inBoundMediaMessages {
            count
          }
          outBoundMediaMessages {
            count
          }
        }
        voice {
          inBound {
            count
          }
          outBound {
            count
          }
        }
      }
    }
  }
`;

export const getPlanQuery = gql`
{
  getPlan {
    numbers {
      included
      used
    }
    usage {
      smsMessages
      mediaMessages
      voiceMinutes
    }
    usageCycle {
      startDate
      endDate
    }
  }
}
`;

export const getOrganizationQuery = gql`
  query GetOrganization($slug: String) {
    getOrganization(slug: $slug) {
      integrationTokens {
        salesforce {
          value
        }
        smartAdvocate {
          value
        }
        genericCRM {
          value
        }
      }
      uplinkSalesforceIntegration {
        flags {
          syncCalls
          syncRecords
          syncMessages
        }
        metadata {
          lastSuccessfulSync
        }
        pollingInterval {
          increment
          unit
        }
      }
      smartAdvocateIntegration {
        flags {
          syncCalls
          syncRecords
          syncMessages
        }
        metadata {
          lastSuccessfulSync
        }
        pollingInterval {
          increment
          unit
        }
      }
      genericCRMIntegration {
        flags {
          syncCalls
          syncRecords
          syncMessages
        }
        metadata {
          lastSuccessfulSync
        }
        pollingInterval {
          increment
          unit
        }
      }
    }
  }
`;

export const getUserNumberUsage = gql`
  {
    getPlan {
      numbers {
        used
        included
      }
    }
  }
`;

/** ACTIVITY */
export const getActivityQuery = gql`
  query GetActivity($phoneNumber: String){
    getActivity(phoneNumber: $phoneNumber) {
      firstInBound
      firstOutBound
      id
      lastInBound
      lastOutBound
      physicalNumber
      status
      systemNumber
      isUser
    }
  }
`;

/** USER */
export const getUserByPhysicalPhoneQuery = gql`
  query GetUserByPhysicalPhone($phoneNumber: String){
    getUserByPhysicalPhone(phoneNumber: $phoneNumber) {
      id
    }
  }
`;