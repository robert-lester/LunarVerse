import { Moment } from 'moment';

export default abstract class ZuoraUtils {
  public static momentToZuoraUsageFormat(moment: Moment): string {
    return moment.utc().format('MM/DD/YYYY');
  }
}