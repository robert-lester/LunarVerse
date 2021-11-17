import moment from 'moment';
import _ from 'lodash';

import {
  CHART_KEYS,
} from '../constants/chart';
import { UsageByPhone, UsageData, UsageSubData, UsageMessage, UsageVoice } from '../apollo/types';
import { ChartLabel, MessageType, ChartType } from '../types';

type ContextType = 'voice' | 'message';

interface ChartItemData {
  name: string;
  [key: string]: number | string;
}

/** Gets the specific key */
export function getKey(keys: { [key: string]: any }, name: string) {
  return Object.keys(keys).find(key =>
    keys[key].includes(name));
}

/** Formats data array into chart format with each date and count */
export function formatDataForChart(dataArray: UsageSubData[], label: string): ChartItemData[] {
  return dataArray.map(item => {
    return ({
      name: moment(item.date).utc().format('MM/DD/YYYY'),
      [label]: item.count
    })
  });
}

/** Gets number data as a group */
export function getGroupedNumberData(data: ChartItemData[]) {
  const test = {};
  _.flattenDeep(data).forEach((i) => {
    const phoneNumber: string = Object.keys(i).find(key => key !== 'name') || '';
    if (test[i.name]) {
      test[i.name][phoneNumber] = i[phoneNumber];
    } else {
      test[i.name] = {};
      test[i.name][phoneNumber] = i[phoneNumber];
    }
  });
  return Object.keys(test).map(key => ({
    name: key,
    ...test[key],
  }));
}

/** Gets the chart's type key */
export const getChartTypeKey = (messageType: MessageType, chartType: ChartType) => {
  let chartTypeKey = ''
  switch(true) {
    case messageType === MessageType.OUTBOUND && chartType === ChartType.MEDIA:
      chartTypeKey = 'outBoundMediaMessages';
      break;
    case messageType === MessageType.OUTBOUND && chartType === ChartType.SMS:
      chartTypeKey = 'outBoundSMS';
      break;
    case messageType === MessageType.OUTBOUND && chartType === ChartType.VOICE:
      chartTypeKey = 'outBound';
      break;
    case messageType === MessageType.INBOUND && chartType === ChartType.MEDIA:
      chartTypeKey = 'inBoundMediaMessages';
      break;
    case messageType === MessageType.INBOUND && chartType === ChartType.SMS:
      chartTypeKey = 'inBoundSMS';
      break;
    default:
     // messageType === MessageType.INBOUND && chartType === ChartType.VOICE:
      chartTypeKey = 'inBound';
      break;
  }
  return chartTypeKey;
}

/** Aggregates date duplicates for counts */
const aggregateDuplicateDates = (array1: UsageSubData[], array2: UsageSubData[])  => {
  let aggregation: UsageSubData[] = [];
  const dataArray = array1.concat(array2);
  _.forOwn(_.groupBy(dataArray, 'date'), (subData, date) => {
    // Aggregate counts
    const count = subData.reduce((acc, curr) => acc + curr.count, 0);
    aggregation.push({
      date,
      count
    });
  });
  return aggregation;
}

// TODO: Lots of duplicated code between here and getIndividualContextData
/** Gets all of the data in given context (voice, all messages, SMS, Media) */
export function getContextUsageData(
  data: UsageData,
  context: ContextType,
  messageType: MessageType,
  chartType: ChartType
): ChartItemData[] {
  const chartTypeKey = getChartTypeKey(messageType, chartType);
  // Outbound
  if (messageType === MessageType.OUTBOUND) {
    // All
    if (chartType === ChartType.ALL_MESSAGES) {
      return formatDataForChart(aggregateDuplicateDates((data[context] as UsageMessage).outBoundSMS, (data[context] as UsageMessage).outBoundMediaMessages), ChartLabel.OUTBOUND);
    }
    return formatDataForChart(data[context][chartTypeKey], ChartLabel.OUTBOUND);
  }
  // Inbound
  if (messageType === MessageType.INBOUND) {
    // All
    if (chartType === ChartType.ALL_MESSAGES) {
      return formatDataForChart(aggregateDuplicateDates((data[context] as UsageMessage).inBoundSMS, (data[context] as UsageMessage).inBoundMediaMessages), ChartLabel.INBOUND);
    }
    return formatDataForChart(data[context][chartTypeKey], ChartLabel.INBOUND);
  }
  // Inbound and outbound
  // Voice
  let inboundData = (data[context] as UsageVoice).inBound;
  let outboundData = (data[context] as UsageVoice).outBound;
  // Media
  if (chartType === ChartType.MEDIA) {
    inboundData = (data[context] as UsageMessage).inBoundMediaMessages;
    outboundData = (data[context] as UsageMessage).outBoundMediaMessages
  }
  // SMS 
  if (chartType === ChartType.SMS) {
    inboundData = (data[context] as UsageMessage).inBoundSMS;
    outboundData = (data[context] as UsageMessage).outBoundSMS;
  }
  // All
  if (chartType === ChartType.ALL_MESSAGES) {
    inboundData = aggregateDuplicateDates((data[context] as UsageMessage).inBoundSMS, (data[context] as UsageMessage).inBoundMediaMessages);
    outboundData = aggregateDuplicateDates((data[context] as UsageMessage).outBoundSMS, (data[context] as UsageMessage).outBoundMediaMessages);
  }
  return formatDataForChart(aggregateDuplicateDates(inboundData, outboundData), ChartLabel.INBOUND_OUTBOUND);
}

/** Gets all of the data for a single number (voice, all messages, SMS, Media) */
export function getIndividualContextData(
  data: UsageByPhone,
  context: ContextType,
  messageType: MessageType,
  chartType: ChartType
): ChartItemData[] {
  // If inbound or outbound
  const userNumber = data.systemNumber;
  const chartTypeKey = getChartTypeKey(messageType, chartType);
  // Outbound all
  if (messageType === MessageType.OUTBOUND && chartType === ChartType.ALL_MESSAGES) {
    return formatDataForChart(aggregateDuplicateDates((data[context] as UsageMessage).outBoundSMS, (data[context] as UsageMessage).outBoundMediaMessages), userNumber);
  }
  // Inbound all
  if (messageType === MessageType.INBOUND && chartType === ChartType.ALL_MESSAGES) {
    return formatDataForChart(aggregateDuplicateDates((data[context] as UsageMessage).inBoundSMS, (data[context] as UsageMessage).inBoundMediaMessages), userNumber);
  }
  // Inbound or outbound, not all
  if (messageType === MessageType.INBOUND || messageType === MessageType.OUTBOUND) {
    return formatDataForChart(data[context][chartTypeKey], userNumber);
  }
  // Inbound and outbound
  // Voice
  let inboundData = (data[context] as UsageVoice).inBound;
  let outboundData = (data[context] as UsageVoice).outBound;
  // Media
  if (chartType === ChartType.MEDIA) {
    inboundData = (data[context] as UsageMessage).inBoundMediaMessages;
    outboundData = (data[context] as UsageMessage).outBoundMediaMessages
  }
  // SMS 
  if (chartType === ChartType.SMS) {
    inboundData = (data[context] as UsageMessage).inBoundSMS;
    outboundData = (data[context] as UsageMessage).outBoundSMS
  }
  // All
  if (chartType === ChartType.ALL_MESSAGES) {
    inboundData = aggregateDuplicateDates((data[context] as UsageMessage).inBoundSMS, (data[context] as UsageMessage).inBoundMediaMessages);
    outboundData = aggregateDuplicateDates((data[context] as UsageMessage).outBoundSMS, (data[context] as UsageMessage).outBoundMediaMessages);
  }
  return formatDataForChart(aggregateDuplicateDates(inboundData, outboundData), userNumber);
}

/** Gets a property key for the type of chart selected */
export function getChartKey(messageType: MessageType, chartType: ChartType) {
  if (chartType === ChartType.ALL_MESSAGES || chartType === ChartType.VOICE) {
    return messageType;
  }
  return CHART_KEYS[chartType][messageType];
}

/** Gets a count for a phone number's data */
export function getPhoneCount(phoneData: UsageSubData[]) {
  return phoneData
    ? phoneData.map(item => item.count).reduce((accumulator, value) => accumulator + value)
    : 0;
}
