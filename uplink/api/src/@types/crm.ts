type CrmCallStatus = 'BUSY'|'COMPLETED'|'DROPPED'|'FAILED'|'NO_ANSWER';

interface CrmUser {
  external_number: string;
  internal_number: string;
  name: null|string;
}

interface CrmMessage {
  call_duration_seconds: null|number;
  call_ended_at: null|string;
  call_initiated_at: null|string;
  call_ringing_seconds: null|number;
  call_status: null|CrmCallStatus;
  call_talk_time_seconds: null|number;
  category: 'CALL'|'TEXT';
  conversation_id: string;
  direction: 'CONTACT_TO_USER'|'USER_TO_CONTACT'|'USER_TO_USER';
  display_url: string;
  message_id: string;
  recipient: CrmUser;
  sender: CrmUser;
  text_message_body: null|string;
  text_message_type: null|'MEDIA'|'SMS';
  text_message_received_at: null|string;
}

export interface CrmGetMessagesResponse {
  messages?: CrmMessage[];
  settings: {
    associate_new_records: boolean;
    create_call_tasks: boolean;
    create_text_tasks: boolean;
    final_page?: boolean;
  };
}