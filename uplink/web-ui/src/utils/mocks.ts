import { createMemoryHistory } from 'history';
import { UserNumberType, UserMessageType } from '../apollo/types';

/** Creates a notification element for tests */
export const createNotificationElement = () => {
  const div = document.createElement('DIV');
  div.id = 'notifications';
  document.body.appendChild(div);
}

export const historyMock = createMemoryHistory({ initialEntries: ['/'] });

export const locationMock = {
  search: '',
  pathname: '',
  state: '',
  hash: ''
};

export const matchMock = {
  params: '',
  isExact: false,
  path: '',
  url: ''
};

export const usageByPhoneMock = {
  message: {
    inBoundMediaMessages: [{
      count: 1,
      date: '2020-08-15'
    }],
    outBoundSMS: [{
      count: 2,
      date: '2020-08-16'
    }],
    inBoundSMS: [{
      count: 1,
      date: '2020-08-17'
    }],
    outBoundMediaMessages: [{
      count: 2,
      date: '2020-08-18'
    }]
  },
  voice: {
    inBound: [
      {
        count: 1,
        date: '2020-08-19'
      }
    ],
    outBound: [
      {
        count: 1,
        date: '2020-08-20'
      },
      {
        count: 1,
        date: '2020-08-21'
      }
    ]
  },
  systemNumber: '(407) 123-1234'
};

export const chartDataMock = {
  usage: {
    message: {
      inBoundMediaMessages: [{
        count: 1,
        date: '2020-08-15'
      }],
      outBoundSMS: [{
        count: 2,
        date: '2020-08-16'
      }],
      inBoundSMS: [{
        count: 1,
        date: '2020-08-17'
      }],
      outBoundMediaMessages: [{
        count: 2,
        date: '2020-08-18'
      }]
    },
    voice: {
      inBound: [
        {
          count: 1,
          date: '2020-08-19'
        }
      ],
      outBound: [
        {
          count: 1,
          date: '2020-08-20'
        },
        {
          count: 1,
          date: '2020-08-21'
        }
      ]
    }
  },
  usageByPhone: [usageByPhoneMock],
  totals: {
    message: {
      inBoundMediaMessages: {
        count: 1
      },
      outBoundSMS: {
        count: 2
      },
      inBoundSMS: {
        count: 1
      },
      outBoundMediaMessages: {
        count: 2
      }
    },
    voice: {
      inBound: {
        count: 1
      },
      outBound: {
        count: 1
      }
    }
  }
};

export const userMock = {
  color: '',
  directDialNumber: '',
  id: 2,
  name: 'Test Name',
  phoneNumber: null,
  physicalNumber: '',
  systemNumber: '',
  type: UserNumberType.USER
};

export const userNumberMock = {
  forward: null,
  id: 1,
  messages: [],
  systemNumber: '(407) 123-1234',
  type: UserNumberType.FORWARD,
  user: userMock,
  callOrText30Days: false
}

export const userPhoneNumberMock = {
  forward: null,
  id: 3,
  messages: [],
  systemNumber: '(586) 474-4468',
  type: UserNumberType.USER,
  user: '',
  callOrText30Days: false
};

export const contactPhoneNumberMock = {
  ...userNumberMock,
  type: UserNumberType.CONTACT
}

export const senderMock = {
  color: 'red',
  id: 1,
  name: 'Juan Bernal',
  phoneNumber: userPhoneNumberMock,
  type: UserMessageType.USER
};

export const messageMock = {
  phoneNumber: {
    systemNumber: ''
  },
  duration: 0,
  media: [
    {
      mime_type: 'img/jpg',
      url: 'https://api.twilio.com/2010-04-01/Accounts/ACe0cb42e1ed00756c6e9f93a607d4ee6a/Messages/MM8cb47cf3fd15e81b093e02191464c173/Media/MEf4af29530a111ab39cd103c5a64c9403'
    },
    {
      mime_type: 'img/jpg',
      url: 'https://api.twilio.com/2010-04-01/Accounts/ACe0cb42e1ed00756c6e9f93a607d4ee6a/Messages/MM8cb47cf3fd15e81b093e02191464c173/Media/MEf4af29530a111ab39cd103c5a64c9403'
    },
    {
      mime_type: 'img/jpg',
      url: 'https://api.twilio.com/2010-04-01/Accounts/ACe0cb42e1ed00756c6e9f93a607d4ee6a/Messages/MM8cb47cf3fd15e81b093e02191464c173/Media/MEf4af29530a111ab39cd103c5a64c9403'
    },
    {
      mime_type: 'img/jpg',
      url: 'https://api.twilio.com/2010-04-01/Accounts/ACe0cb42e1ed00756c6e9f93a607d4ee6a/Messages/MM8cb47cf3fd15e81b093e02191464c173/Media/MEf4af29530a111ab39cd103c5a64c9403'
    }
  ],
  created_at: 'Wed, 19 Dec 2018 16:30:02 GMT',
  sender: senderMock,
  message: 'Hi!',
  public_id: '06b224bd-cb0c-4dbe-bce6-097413764ad8',
  type: UserMessageType.USER
};

export const conversationPublicIdMock = '6e8218d4-8b15-456a-a83f-0a15745d10aa';

export const conversationMock = {
  id: 0,
  public_id: conversationPublicIdMock,
  phoneNumbers: [{
    forward: null,
    id: 123,
    messages: [],
    systemNumber: '407-738-7892',
    type: UserNumberType.CONTACT,
    user: userMock,
    callOrText30Days: false
  }],
  messages: [
    messageMock
  ],
  updated_at: ''
};

export const dateRangeMock = {
  initial: null,
  final: null
};

export const activityMock = {
  firstInBound: '',
  firstOutBound: '',
  id: 0,
  invite: '',
  lastInBound: '',
  lastOutBound: '',
  physicalNumber: '',
  status: '',
  systemNumber: '',
  isUser: true
};

export const urlTokenMock = {
  orgSlug: '',
  email: '',
  token: ''
}