// : Drop this down to two keys of an array each
export const SMS_KEYS = {
  inBound: 'inBoundSMS',
  outBound: 'outBoundSMS',
};
export const MEDIA_KEYS = {
  inBound: 'inBoundMediaMessages',
  outBound: 'outBoundMediaMessages',
};
export const CHART_KEYS = {
  SMS: SMS_KEYS,
  Media: MEDIA_KEYS,
};

export const INBOUND_KEYS = {
  inBound: ['voice', 'allMessages'],
  inBoundSMS: ['SMS'],
  inBoundMediaMessages: ['Media'],
};
export const OUTBOUND_KEYS = {
  outBound: ['voice', 'allMessages'],
  outBoundSMS: ['SMS'],
  outBoundMediaMessages: ['Media'],
};
