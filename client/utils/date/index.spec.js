import moment from 'moment';
import { iosMailDateFormat, generateMessageCenterDateCopy, getFormattedDateTimeWithTimezone } from './index.ts';

describe('Utils/Date', () => {
  it('iosMailDateFormat', () => {
    const sentTime = moment();

    // Now
    expect(iosMailDateFormat(sentTime.format())).toBe(sentTime.format('[Today at] hh:mm a'));

    // Yesterday
    sentTime.set({
      days: sentTime.day() - 1,
    });
    expect(iosMailDateFormat(sentTime.format())).toBe(sentTime.format('[Yesterday at] hh:mm a'));

    // Before yesterday or far far ago
    sentTime.set({
      years: sentTime.year() - 1,
    });
    expect(iosMailDateFormat(sentTime.format())).toBe(sentTime.format('DD MMM YYYY [at] hh:mm a'));
  });

  describe('generateMessageCenterDateCopy', () => {
    it('Shall tranform utc timeString to local time with right format', () => {
      const now = moment();
      const utcTimeString = now.utc().format()
      const localTimeString = now.local().format('MMMM Do YYYY, h:mma');
      expect(generateMessageCenterDateCopy(utcTimeString)).toBe(localTimeString);
    });
  });

  it('getFormattedDateTimeWithTimezone return date', () => {
    let res = getFormattedDateTimeWithTimezone(new Date('2022-03-25T23:50'))
    res = res.slice(0, -4).trim() // remove timezone to run test in any machine
    expect(res).toBe('Mar 25th, 2022 11:50pm')
  })
});
