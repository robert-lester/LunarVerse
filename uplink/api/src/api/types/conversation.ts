export default /* GraphQL */ `
    input ConversationAttributes {
        messageCount       : Int
        offset             : Int
    }

    # A conversation object containing all message contents
    type Conversation implements Node {
        id                          : Int! @deprecated(reason: "public_id should be used instead")
        public_id                   : String!
        finalDate                    : String
        messageCount                : Int
        offset                      : Int
        # Organization identifier
        organization_id             : ID!
        # System phone number involved in the conversation
        phoneNumbers                : [PhoneNumber!]!
        created_at                  : Date
        updated_at                  : Date
        # Text content ongoing in the conversation
        messages                    : [Message]
    }
    extend type Query {
        # Gets a single conversation by ID, starting date and other attributes
        getConversation(
            id                      : Int
            finalDate               : String
            public_id               : String
            attributes              : ConversationAttributes
        )                           : Conversation
        getConversations(
            phoneNumbers            : [String]
            filter                  : DateRange
            sort                    : SortOptions
        )                           : [Conversation]
    }
`;
