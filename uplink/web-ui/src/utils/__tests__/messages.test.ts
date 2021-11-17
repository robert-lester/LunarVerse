import { getMediaCount } from '../messages';
import { UserMessageType } from '../../apollo/types';

describe('Messages utils', () => {
  it('should return media count of 0', () => {
    const messages = [
      {
        created_at: '',
        sender_id: '',
        media: [],
        sender: {
          color: '',
          id: 0,
          name: '',
          type: ''
        },
        message: '',
        public_id: 'b639d597-01e1-4625-86c7-df8ccf4ca7c7',
        type: UserMessageType.CALL,
        phoneNumber: {
          systemNumber: ''
        },
        duration: 0
      }
    ];
    expect(getMediaCount(messages)).toEqual(0);
  });

  it('should return media count of 1', () => {
    const messages = [
      {
        created_at: '',
        sender_id: '',
        media: [{
          mime_type: '',
          url: ''
        }],
        sender: {
          color: '',
          id: 0,
          name: '',
          type: ''
        },
        message: '',
        public_id: 'b639d597-01e1-4625-86c7-df8ccf4ca7c7',
        type: UserMessageType.CALL,
        phoneNumber: {
          systemNumber: ''
        },
        duration: 0
      }
    ];
    expect(getMediaCount(messages)).toEqual(1);
  });
});