export default /* GraphQL */ `
  enum PhoneType {
    CONTACT
    POOL
    USER
    FORWARD
    UNASSIGNED
  }
  enum AssignedType {
    UNASSIGNED
    ASSIGNED
  }
  enum SortOptions {
    ASC
    DESC
  }
  # A phone number object
  type PhoneNumber implements Node {
    id                          : Int!
    # Twilio phone number SID
    sid                         : String!
    # Track recycle notification
    notified                    : Boolean!
    # Organization identifier
    organization_id             : ID!
    # Internal phone number identifier
    type                        : PhoneType!
    # Forwarded phone number
    forward : PhoneNumber
    # Forwarded phone number identifier
    forward_id: ID
    # Actual phone number value
    systemNumber                : PhoneString!
    # If the phone number has conversations
    hasConversations           : Boolean
    # If phone number has recieved a message in the last 30 days
    callOrText30Days           : Boolean
    # If the phone number has been assigned
    isAssigned                  : Boolean
    # List of conversations involving the user
    conversations(
      sort                      : SortOptions
      filter                    : DateFilters
    )                           : [Conversation]
    created_at                  : Date
    # List of messages sent by the user
    messages                    : [Message]
    updated_at                  : Date
    # User assigned to the phone number
    user                        : User
  }

  input PhoneOptions {
    external_phone_number   : String
    toll_free               : Boolean
    area_code               : String
    contains                : String
    near_lat_long           : String
    in_locality             : String
    in_region               : String
    in_lata                 : String
    in_postal_code          : String
  }

  input DateRange {
    initial                     : Date
    final                       : Date
  }
  input DateFilters {
      date                      : Date
      dateRange                 : DateRange
  }

  input UpdateablePhoneNumberFields {
    id                          : Int
    assigned_id                : Int
    type                        : PhoneType
    notified                    : Boolean
  }

  extend type Query {
    # Gets a single phone number
    getPhoneNumber(
      id                        : Int
      phoneNumber               : String
    )                           : PhoneNumber
    # Gets all phone numbers in the system
    getPhoneNumbers(
      phoneNumbers              : [Int]
      type                      : [PhoneType]
      filter                    : AssignedType
      hasConversations        : Boolean
      isAssigned               : Boolean
    )                           : [PhoneNumber]
  }

  extend type Mutation {
    # Updates the specific phone number
    updatePhoneNumber(
      args                      : UpdateablePhoneNumberFields
    )                           : PhoneNumber!
    # Updates the specific phone number
    updatePhoneNumbers(
      args                      : [UpdateablePhoneNumberFields]
    )                           : [PhoneNumber]!
    # Deletes the specific phone number
    deletePhoneNumber(id: Int)  : Boolean
  }
`;
