import moment from 'moment'

export class TimeUtil {
  // TODO: implement unit tests
  public static getUnixTimeForAFutureDay(days: number): number {
    return moment().add(days, 'days').unix()
  }
}
