/**
 * 时间戳转时间 YYYY-YY-DD HH-MM-ss  格式
 *  @params timestamp: 13位时间戳 | new Date() | Date()
 *console.log(dateFormat(1714528800000, 'YY-MM-DD HH:mm:ss'))
 *   @params format => YY：年，M：月，D：日，H：时，m：分钟，s：秒，SSS：毫秒
 */
export function dateFormat(timestamp: number | string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  var date = new Date(timestamp)

  function fixedTwo(value: number): string {
    return value < 10 ? '0' + value : String(value)
  }

  var showTime = format
  if (showTime.includes('SSS')) {
    const S = date.getMilliseconds()
    showTime = showTime.replace('SSS', '0'.repeat(3 - String(S).length) + S)
  }
  if (showTime.includes('YY')) {
    const Y = date.getFullYear()
    showTime = showTime.includes('YYYY') ? showTime.replace('YYYY', String(Y)) : showTime.replace('YY', String(Y).slice(2, 4))
  }
  if (showTime.includes('M')) {
    const M = date.getMonth() + 1
    showTime = showTime.includes('MM') ? showTime.replace('MM', fixedTwo(M)) : showTime.replace('M', String(M))
  }
  if (showTime.includes('D')) {
    const D = date.getDate()
    showTime = showTime.includes('DD') ? showTime.replace('DD', fixedTwo(D)) : showTime.replace('D', String(D))
  }
  if (showTime.includes('H')) {
    const H = date.getHours()
    showTime = showTime.includes('HH') ? showTime.replace('HH', fixedTwo(H)) : showTime.replace('H', String(H))
  }
  if (showTime.includes('m')) {
    var m = date.getMinutes()
    showTime = showTime.includes('mm') ? showTime.replace('mm', fixedTwo(m)) : showTime.replace('m', String(m))
  }
  if (showTime.includes('s')) {
    var s = date.getSeconds()
    showTime = showTime.includes('ss') ? showTime.replace('ss', fixedTwo(s)) : showTime.replace('s', String(s))
  }
  return showTime
}

/**
 * 日期 时间 转13位时间戳
 */
export function timeTransition(time: string) {
  var timestamp = Date.parse(`${new Date(time)}`)
  return timestamp
}


/**
 * 时间工具类
 */
export class DateUtils {
  /**
   * 将时间转换成指定格式
   * @param date 时间对象或时间字符串
   * @param format 格式，默认为 'YYYY-MM-DD HH:mm:ss'
   * @returns 格式化后的时间字符串
   */
  static formatDate(date: Date | string, format = 'YYYY-MM-DD HH:mm:ss'): string {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) {
      throw new Error('Invalid Date');
    }

    const pad = (num: number) => num.toString().padStart(2, '0');

    return format
      .replace(/YYYY/g, d.getFullYear().toString())
      .replace(/MM/g, pad(d.getMonth() + 1))
      .replace(/DD/g, pad(d.getDate()))
      .replace(/HH/g, pad(d.getHours()))
      .replace(/mm/g, pad(d.getMinutes()))
      .replace(/ss/g, pad(d.getSeconds()));
  }

  /**
   * 将时间戳转换成时间
   * @param timestamp 时间戳（毫秒）
   * @returns 时间对象
   */
  static timestampToDate(timestamp: number): Date {
    return new Date(timestamp);
  }

  /**
   * 获取当前时间
   * @returns 当前时间对象
   */
  static getCurrentDate(): Date {
    return new Date();
  }

  static getCurrentDateStr(): string {
    return this.formatDate(this.getCurrentDate(), 'YYYY-MM-DD');
  }

  /**
   * 获取当前时间的前几天或后几天
   * @param days 天数，正数表示后几天，负数表示前几天
   * @returns 计算后的时间对象
   */
  static getDateBeforeAfterDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  /**
   * 获取时间范围内所有的日期
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 日期字符串数组，格式为 'YYYY-MM-DD'
   */
  static getDatesInRange(startDate: Date | string, endDate: Date | string): string[] {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid Date');
    }

    const dates: string[] = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);

    while (current <= end) {
      dates.push(this.formatDate(current, 'YYYY-MM-DD'));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * 根据天数生成时间范围
   * @param days 天数，正数表示从现在开始往后几天，负数表示从现在开始往前几天
   * @returns 包含开始和结束日期的对象
   */
  static generateDateRangeByDays(days: number): { startDate: Date; endDate: Date } {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return {
      startDate: days >= 0 ? startDate : endDate,
      endDate: days >= 0 ? endDate : startDate,
    };
  }

  /**
   * 根据天数生成时间范围
   * @param days 天数，正数表示从现在开始往后几天，负数表示从现在开始往前几天
   * @returns 包含开始和结束日期的对象
   */
  static generateDateRangeByDaysStr(days: number): { startDate: string; endDate: string } {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return {
      startDate: this.formatDate(startDate,  'YYYY-MM-DD'),
      endDate: this.formatDate(endDate,  'YYYY-MM-DD')
    };
  }
}
