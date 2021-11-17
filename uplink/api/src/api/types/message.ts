export default /* GraphQL */ `
    enum MessageType {
        CALL
        USER
        SYSTEM
    }

    enum Origin {
        PHONE
        WEB
    }

    # A message object containing all message contents
    # NOTE: We can't implement Node anymore since "id" is no longer public
    type Message {
        # TODO: Remove the id field after backwards compatibility is no longer
        # needed for old SF versions.
        id                          : Int
        public_id                   : String!
        # Organization identifier
        organization_id             : ID!
        created_at                  : Date
        billable_units              : Int
        sender                      : User
        ring_duration               : Int
        talk_duration               : Int
        duration                    : Int
        phoneNumber                 : PhoneNumber
        conversation                : Conversation!
        type                        : MessageType
        updated_at                  : Date
        # Message content
        message                     : String
        # Media Messages urls
        media                       : [Media]
        origin                      : Origin
    }

    enum CrmCallStatus {
        BUSY
        COMPLETED
        DROPPED
        FAILED
        NO_ANSWER
    }

    enum CrmMessageCategory {
        CALL
        TEXT
    }

    enum CrmMessageDirection {
        CONTACT_TO_USER
        USER_TO_CONTACT
        USER_TO_USER
    }

    enum CrmTextMessageType {
        MEDIA
        SMS
    }

    type CrmMessage {
        call_duration_seconds       : Int
        call_ended_at               : Date
        call_initiated_at           : Date
        call_ringing_seconds        : Int
        call_status                 : CrmCallStatus
        call_talk_time_seconds      : Int
        category                    : CrmMessageCategory!
        conversation_id             : String!
        direction                   : CrmMessageDirection!
        display_url                 : String!
        message_id                  : String!
        recipient                   : CrmUser!
        sender                      : CrmUser!
        text_message_body           : String
        text_message_media          : String
        text_message_type           : CrmTextMessageType
        text_message_received_at    : Date
    }

    type CrmMessageSettings {
        associate_new_records       : Boolean!
        create_call_tasks           : Boolean!
        create_text_tasks           : Boolean!
        final_page                   : Boolean!
    }

    type CrmMessageResponse {
        messages                    : [CrmMessage]!
        settings                    : CrmMessageSettings!
    }

    extend type Query {
        getCrmMessages(
            last_received_msg_id    : String
            max_response_size_kb    : Int
        )                           : CrmMessageResponse
    }

  # Mutations
  input sendMessageFromWebAppRequest {
    To: String
    From: String
    Body: String
    NumMedia: Int
  }

  type sendMessageFromWebAppResponse {
    To: String
    From: String
    Body: String
    NumMedia: Int
  }

  extend type Mutation {
    sendMessageFromWebApp(
      fields: sendMessageFromWebAppRequest
    ): sendMessageFromWebAppResponse
  }
`;
