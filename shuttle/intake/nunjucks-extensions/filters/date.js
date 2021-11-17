import moment from 'moment';
import momentTimezone from 'moment-timezone';
import strict from './strict';

export const name = 'date';
export const func = strict((str, format, timezone) => {
  if (str instanceof Date) {
    str = str.toISOString();
  }
  let date = str.split('T').join(' ');

  if (format) {
    // If there is a timezone included, use it
    if (timezone) {
      date = momentTimezone(str, 'YYYY-MM-DD HH:mm:ss').tz(timezone).format(format);
    } else { // Otherwise default to the normal moment library
      date = moment(str, 'YYYY-MM-DD HH:mm:ss').format(format);
    }
  } else {
    // If nothing is passed, convert it to an ISO String
    date = moment(str).toISOString();
  }

  return date;
}, 2);
