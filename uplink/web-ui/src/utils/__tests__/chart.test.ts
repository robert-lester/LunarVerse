import { getKey, getChartKey, getPhoneCount, getIndividualContextData, getContextUsageData, getChartTypeKey, getGroupedNumberData } from '../chart';
import { MessageType, ChartType } from '../../types';
import { usageByPhoneMock } from '../mocks';

describe('Chart utils', () => {
  it('should return key "test"', () => {
    const object = {
      test: ['one', 'two']
    };
    expect(getKey(object, 'one')).toEqual('test');
  });

  it('should return passed messageType as chartKey', () => {
    expect(getChartKey(MessageType.OUTBOUND, ChartType.ALL_MESSAGES)).toEqual(MessageType.OUTBOUND);
  });

  it('should return chartKey of inBoundSMS', () => {
    expect(getChartKey(MessageType.INBOUND, ChartType.SMS)).toEqual('inBoundSMS');
  });

  it('should return a phone count of 0', () => {
    expect(getPhoneCount([{ count: 0, date: '' }])).toEqual(0);
  });

  it('should return grouped number data by name', () => {
    const returnValue = [
      {
        '(407) 123-1234': 1,
        name: '08/19/2020'
      },
    ];
    expect(getGroupedNumberData(returnValue)).toEqual(returnValue);
  });

  it('should return grouped number data by name and set the initial nonexistant data', () => {
    const data = [
      {
        '(407) 123-1234': 1,
        name: '08/19/2020'
      },
      {
        '(407) 123-1234': 1,
        name: '08/19/2020'
      }
    ];
    expect(getGroupedNumberData(data)).toEqual([data[0]]);
  });

  it('should return chartTypeKey of outBound', () => {
    expect(getChartTypeKey(MessageType.OUTBOUND, ChartType.VOICE)).toEqual('outBound');
  });

  it('should return chartTypeKey of inBoundSMS', () => {
    expect(getChartTypeKey(MessageType.INBOUND, ChartType.SMS)).toEqual('inBoundSMS');
  });

  it('should return chartTypeKey of inBoundMediaMessages', () => {
    expect(getChartTypeKey(MessageType.INBOUND, ChartType.MEDIA)).toEqual('inBoundMediaMessages');
  });

  it('should return chartTypeKey of outBoundMediaMessages', () => {
    expect(getChartTypeKey(MessageType.OUTBOUND, ChartType.MEDIA)).toEqual('outBoundMediaMessages');
  });

  it('should return a phone count of 1', () => {
    const usageSubData = [
      {
        count: 1,
        date: '10/20/2019'
      }
    ];
    expect(getPhoneCount(usageSubData)).toEqual(1);
  });

  it('should return data for a single number', () => {
    const returnValue = [{
      name: '08/19/2020',
      '(407) 123-1234': 1
    }];
    expect(getIndividualContextData(usageByPhoneMock, 'voice', MessageType.INBOUND, ChartType.VOICE)).toEqual(returnValue);
  });

  it('should return data for inbound and outbound voice', () => {
    const returnValue = [
      {
        '(407) 123-1234': 1,
        name: '08/19/2020'
      },
      {
        '(407) 123-1234': 1,
        name: '08/20/2020'
      },
      {
        '(407) 123-1234': 1,
        name: '08/21/2020'
      }
    ];
    expect(getIndividualContextData(usageByPhoneMock, 'voice', MessageType.INBOUND_OUTBOUND, ChartType.VOICE)).toEqual(returnValue);
  });

  it('should return data for inbound and outbound all messages', () => {
    const returnValue = [
      {
        '(407) 123-1234': 1,
        name: '08/17/2020'
      },
      {
        '(407) 123-1234': 1,
        name: '08/15/2020'
      },
      {
        '(407) 123-1234': 2,
        name: '08/16/2020'
      },
      {
        '(407) 123-1234': 2,
        name: '08/18/2020'
      }
    ];
    expect(getIndividualContextData(usageByPhoneMock, 'message', MessageType.INBOUND_OUTBOUND, ChartType.ALL_MESSAGES)).toEqual(returnValue);
  });

  it('should return data for inbound and outbound sms', () => {
    const returnValue = [
      {
        '(407) 123-1234': 1,
        name: '08/17/2020'
      },
      {
        '(407) 123-1234': 2,
        name: '08/16/2020'
      },
    ];
    expect(getIndividualContextData(usageByPhoneMock, 'message', MessageType.INBOUND_OUTBOUND, ChartType.SMS)).toEqual(returnValue);
  });

  it('should return data for inbound and outbound media', () => {
    const returnValue = [
      {
        '(407) 123-1234': 1,
        name: '08/15/2020'
      },
      {
        '(407) 123-1234': 2,
        name: '08/18/2020'
      }
    ];
    expect(getIndividualContextData(usageByPhoneMock, 'message', MessageType.INBOUND_OUTBOUND, ChartType.MEDIA)).toEqual(returnValue);
  });

  it('should return data for inbound all', () => {
    const returnValue = [
      {
        '(407) 123-1234': 1,
        name: '08/17/2020'
      },
      {
        '(407) 123-1234': 1,
        name: '08/15/2020'
      },
    ];
    expect(getIndividualContextData(usageByPhoneMock, 'message', MessageType.INBOUND, ChartType.ALL_MESSAGES)).toEqual(returnValue);
  });

  it('should return data for outbound all', () => {
    const returnValue = [
      {
        '(407) 123-1234': 2,
        name: '08/16/2020'
      },
      {
        '(407) 123-1234': 2,
        name: '08/18/2020'
      }
    ];
    expect(getIndividualContextData(usageByPhoneMock, 'message', MessageType.OUTBOUND, ChartType.ALL_MESSAGES)).toEqual(returnValue);
  });

  it('should return context usage data for outbound all', () => {
    const returnValue = [
      {
        'Inbound and Outbound': 1,
        name: '08/17/2020'
      },
      {
        'Inbound and Outbound': 1,
        name: '08/15/2020'
      },
      {
        'Inbound and Outbound': 2,
        name: '08/16/2020'
      },
      {
        'Inbound and Outbound': 2,
        name: '08/18/2020'
      }
    ];
    expect(getContextUsageData(usageByPhoneMock, 'message', MessageType.INBOUND_OUTBOUND, ChartType.ALL_MESSAGES)).toEqual(returnValue);
  });

  it('should return context usage data for inbound and outbound sms', () => {
    const returnValue = [
      {
        'Inbound and Outbound': 1,
        name: '08/17/2020'
      },
      {
        'Inbound and Outbound': 2,
        name: '08/16/2020'
      },
    ];
    expect(getContextUsageData(usageByPhoneMock, 'message', MessageType.INBOUND_OUTBOUND, ChartType.SMS)).toEqual(returnValue);
  });

  it('should return context usage data for inbound and outbound media', () => {
    const returnValue = [
      {
        'Inbound and Outbound': 1,
        name: '08/15/2020'
      },
      {
        'Inbound and Outbound': 2,
        name: '08/18/2020'
      }
    ];
    expect(getContextUsageData(usageByPhoneMock, 'message', MessageType.INBOUND_OUTBOUND, ChartType.MEDIA)).toEqual(returnValue);
  });

  it('should return context usage data for inbound sms', () => {
    const returnValue = [
      {
        'Inbound': 1,
        name: '08/17/2020'
      },
    ];
    expect(getContextUsageData(usageByPhoneMock, 'message', MessageType.INBOUND, ChartType.SMS)).toEqual(returnValue);
  });

  it('should return context usage data for inbound all', () => {
    const returnValue = [
      {
        'Inbound': 1,
        name: '08/17/2020'
      },
      {
        'Inbound': 1,
        name: '08/15/2020'
      }
    ];
    expect(getContextUsageData(usageByPhoneMock, 'message', MessageType.INBOUND, ChartType.ALL_MESSAGES)).toEqual(returnValue);
  });

  it('should return context usage data for outbound sms', () => {
    const returnValue = [
      {
        'Outbound': 2,
        name: '08/16/2020'
      }
    ];
    expect(getContextUsageData(usageByPhoneMock, 'message', MessageType.OUTBOUND, ChartType.SMS)).toEqual(returnValue);
  });

  it('should return context usage data for outbound all', () => {
    const returnValue = [
      {
        'Outbound': 2,
        name: '08/16/2020'
      },
      {
        'Outbound': 2,
        name: '08/18/2020'
      }
    ];
    expect(getContextUsageData(usageByPhoneMock, 'message', MessageType.OUTBOUND, ChartType.ALL_MESSAGES)).toEqual(returnValue);
  });
});