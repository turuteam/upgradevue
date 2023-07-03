import moment from 'moment';

const formats = {
  TIME_FORMAT: 'h:mma',
  AU_DATE_FORMAT: 'DD/MM/YYYY',
  US_DATE_FORMAT: 'MM/DD/YYYY',
  DEFAULT_TIME: '6:00pm',
  DATETIME_FORMAT: 'YYYY-MM-DDTHH:mm:ss',
  DATE_FORMAT: 'ddd Do MMM, YYYY',
  DATE_FORMAT_US: 'ddd MMM Do, YYYY',
  DATE_FORMAT_NO_COMMA: 'ddd Do MMM YYYY',
  DATE_FORMAT_US_NO_DAY: 'MMM Do, YYYY',
  DATE_FORMAT_US_COMMA_AFTER_DAY: 'ddd, MMM Do YYYY',
};

export function isValidTzDate(date: string) {
  // @ts-ignore
  return moment.utc(date)._isValid;
};

export function displayDateRange(startDate: Date, endDate: Date, timeZone: string) {
  if (!timeZone) return '';

  // ALWAYS use UTC when working with moment since our timezone component is stored seperately
  const start = moment.utc(startDate).tz(timeZone);
  const end = endDate ? moment.utc(endDate).tz(timeZone) : null;

  if (end) {
    if (start.diff(end, 'days') === 0) {
      return start.format(formats.DATE_FORMAT);
    }

    let startString;

    if (start.diff(end, 'years') === 0) {
      startString = start.format('ddd MMM Do');
    } else {
      startString = start.format(formats.DATE_FORMAT);
    }

    const endString = end.format(formats.DATE_FORMAT);

    return `${startString} - ${endString}`;
  } else {
    const startString = start.format(formats.DATE_FORMAT);

    return `${startString}`
  }
};

export function displayDateRangeUS(startDate: Date, endDate: Date, timeZone: string) {
  if (!timeZone) return '';

  // ALWAYS use UTC when working with moment since our timezone component is stored seperately
  const start = moment.utc(startDate).tz(timeZone);
  const end = endDate ? moment.utc(endDate).tz(timeZone) : null;

  if (end) {
    if (start.diff(end, 'days') === 0) {
      return start.format(formats.DATE_FORMAT_US);
    }

    let startString;

    if (start.diff(end, 'years') === 0) {
      startString = start.format('ddd MMM Do');
    } else {
      startString = start.format(formats.DATE_FORMAT_US);
    }

    const endString = end.format(formats.DATE_FORMAT_US);

    return `${startString} - ${endString}`;
  } else {
    const startString = start.format(formats.DATE_FORMAT_US);

    return `${startString}`
  }
};

export function displayDateRangeNoComma(startDate: Date, endDate: Date, timeZone: string) {
  if (!timeZone) return '';

  // ALWAYS use UTC when working with moment since our timezone component is stored seperately
  const start = moment.utc(startDate).tz(timeZone);
  const end = endDate ? moment.utc(endDate).tz(timeZone) : null;

  if (end) {
    if (start.diff(end, 'days') === 0) {
      return start.format(formats.DATE_FORMAT_NO_COMMA);
    }

    let startString;

    if (start.diff(end, 'years') === 0) {
      startString = start.format('ddd MMM Do');
    } else {
      startString = start.format(formats.DATE_FORMAT_NO_COMMA);
    }

    const endString = end.format(formats.DATE_FORMAT_NO_COMMA);

    return `${startString} - ${endString}`;
  } else {
    const startString = start.format(formats.DATE_FORMAT_NO_COMMA);

    return `${startString}`
  }
};

export function displayDateRangeUSNoDay(startDate: Date, endDate: Date, timeZone: string) {
  if (!timeZone) return '';

  // ALWAYS use UTC when working with moment since our timezone component is stored seperately
  const start = moment.utc(startDate).tz(timeZone);
  const end = endDate ? moment.utc(endDate).tz(timeZone) : null;

  if (end) {
    if (start.diff(end, 'days') === 0) {
      return start.format(formats.DATE_FORMAT_US_NO_DAY);
    }

    let startString;

    if (start.diff(end, 'years') === 0) {
      startString = start.format('ddd MMM Do');
    } else {
      startString = start.format(formats.DATE_FORMAT_US_NO_DAY);
    }

    const endString = end.format(formats.DATE_FORMAT_US_NO_DAY);

    return `${startString} - ${endString}`;
  } else {
    const startString = start.format(formats.DATE_FORMAT_US_NO_DAY);

    return `${startString}`
  }
};

export function displayDateUSRangeCommaAfterDay(startDate: Date, endDate: Date, timeZone: string) {
  if (!timeZone) return '';

  // ALWAYS use UTC when working with moment since our timezone component is stored seperately
  const start = moment.utc(startDate).tz(timeZone);
  const end = endDate ? moment.utc(endDate).tz(timeZone) : null;

  if (end) {
    if (start.diff(end, 'days') === 0) {
      return start.format(formats.DATE_FORMAT_US_COMMA_AFTER_DAY);
    }

    let startString;

    if (start.diff(end, 'years') === 0) {
      startString = start.format('ddd MMM Do');
    } else {
      startString = start.format(formats.DATE_FORMAT_US_COMMA_AFTER_DAY);
    }

    const endString = end.format(formats.DATE_FORMAT_US_COMMA_AFTER_DAY);

    return `${startString} - ${endString}`;
  } else {
    const startString = start.format(formats.DATE_FORMAT_US_COMMA_AFTER_DAY);

    return `${startString}`
  }
};

export function generateMessageCenterDateCopy(timeString: Date, timezone: string | false) {
  let formattedDateString = null;
  if (!timezone) {
    formattedDateString = moment.utc(timeString).local().format('MMMM Do YYYY, h:mma');
  } else {
    formattedDateString = `${moment.utc(timeString).tz(timezone).format('MMMM Do YYYY, h:mma')} - ${timezone}` ;
  }

  if(formattedDateString.indexOf('Invalid date') === 0) {
    return timeString;
  } else {
    return formattedDateString;
  }
};


// given a date, returns
// date/time/timezone in format of
//
// Jan 7th, 2021 11:51am AEDT
export function getFormattedDateTimeWithTimezone(dateTime: any) {
  const shortEnUSFormatter = new Intl.DateTimeFormat('en-US', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  })

  const pluralRules = new Intl.PluralRules('en-US', {
      type: 'ordinal'
  })
  const suffixes = {
      'one': 'st',
      'two': 'nd',
      'few': 'rd',
      'other': 'th'
  }
  // @ts-ignore
  const convertToOrdinal = (number) => `${number}${suffixes[pluralRules.select(number)]}`

  // @ts-ignore
  const extractValueAndCustomizeDayOfMonth = (part) => {
    if (part.type === "day") {
        return convertToOrdinal(part.value)
    }
    return part.value
  }

  let date = shortEnUSFormatter.formatToParts(dateTime).map(extractValueAndCustomizeDayOfMonth).join("")

  let timeRaw = dateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })
  let time = timeRaw.replace(/\s/g, '').toLowerCase()

  const timeZoneAbbreviated = (date: any) => {
    let { 1: tz } = date.toString().match(/\((.+)\)/)

    // In Chrome browser, new Date().toString() is
    // "Wed Jan 06 2020 16:21:38 GMT+1100 (Australian Eastern Daylight Time)"

    // In Safari browser, new Date().toString() is
    // "Wed Jan 06 2020 16:21:38 GMT+1100 (AEDT)"

    if (tz.includes(" ")) {
      // @ts-ignore
      return tz.split(" ").map(([first]) => first).join("")
    } else {
      return tz
    }
  }

  let timezone = timeZoneAbbreviated(dateTime)

  let formattedDateTime = `${date} ${time} ${timezone}`
  return formattedDateTime
}

export function generateDateWithoutTime(timeString: Date) {
  const formattedDateString = moment.utc(timeString).local().format('MMMM Do YYYY');
  if (formattedDateString.indexOf('Invalid date') === 0) {
    return timeString;
  } else {
    return formattedDateString;
  }
};

export function generateDateWithTime(timeString: Date) {
  const formattedDateString = moment.utc(timeString).local().format('MMMM Do YYYY, h:mma');
  if (formattedDateString.indexOf('Invalid date') === 0) {
    return timeString;
  } else {
    return formattedDateString;
  }
};

export function countDaysFromDate(timeString: Date) {
  return moment().diff(moment(timeString), 'days');
};

export function iosMailDateFormat(timeString: Date) {
  const now = moment();
  const sentTime = timeString ? moment(timeString).local() : moment();
  const startOfSentTimeDay = moment(timeString).local().startOf('day');
  if (now.diff(startOfSentTimeDay, 'days') > 1) {
    return sentTime.format('DD MMM YYYY [at] hh:mm a');
  } else if (now.diff(startOfSentTimeDay, 'days') > 0) {
    return sentTime.format('[Yesterday at] hh:mm a');
  }
  return sentTime.format('[Today at] hh:mm a');
};

export function timeago(date: Date) {
  // Expects the time in UTC
  const timeElapsed = moment.utc(date).fromNow();
  return `${timeElapsed}`;
};

export function addZToTimestamp(timestamp: string) {
  if (!timestamp || timestamp.length < 1) return timestamp;
  const hasZ = timestamp.slice(-1) === "Z";
  return hasZ ? timestamp : `${timestamp}Z`;
}
