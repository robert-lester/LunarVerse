import { Moment } from 'moment';

export default abstract class KnexUtils {
  public static momentToKnexFormat(moment: Moment): string {
    return moment.utc().format('YYYY-MM-DD');
  }
}