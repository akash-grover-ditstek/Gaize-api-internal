import moment from 'moment-timezone';

export const SECOND = 1;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const MILLISECONDS = {
  SECOND: 1000,
  MINUTE: SECOND * 60,
  HOUR: MINUTE * 60,
  DAY: HOUR * 24,
};

export function now() {
  return moment().unix();
}

export function serverTimeZone() {
  return moment.tz.guess();
}


/**
 * convering unix timestamp to timezone's unix timestamp without date change
 * @param  {} timestampInUnix
 * @param  {} timezone="America/Denver"
 */
export function timestamp(timestampInUnix, timezone = "America/Denver") {
    let date = new Date(timestampInUnix*1000)
    let format = "YY-MM-DD h:mm:s a Z"
    var convertedDate = moment(date).tz(timezone, true).format(format)
    var unixTimeStamp = moment(convertedDate, format).format("X")
    return unixTimeStamp
}

/**
 * convering unix timestamp to timezone's unix timestamp with date change
 * @param  {} timestampInUnix
 * @param  {} timezone="America/Denver"
 */
export function timezoneUnix(timestampInUnix, timezone = "America/Denver") {
    let date = new Date(timestampInUnix*1000)
    let format = "YY-MM-DD h:mm:s a Z"
    var convertedDate = moment(date).tz(timezone).format(format)
    console.log("Timezone Datetime : ", convertedDate);
    var unixTimeStamp = moment(convertedDate, format).format("X")
    return unixTimeStamp
}

export function fromNow(seconds) {
  return now() + seconds;
}

export function addTimeToUnixTimeStamp(unixTimeStamp, unitValue, unit = "hours") {
    return moment(unixTimeStamp*1000).add(unitValue, unit).unix()
}

export function fromStartOfDay(seconds) {
  const startOfDay = moment().startOf('day').unix();
  return Math.floor(startOfDay + seconds);
}

export const date = function (seconds) {
  if (!seconds) return new Date();
  const millis = seconds * 1000;
  return new Date(millis);
};

export const fromDate = function (millis) {
  return Math.floor(new Date(millis).getTime() / 1000);
};

export const format = function (secondsSinceEpoch, format = 'M/DD/YYYY h:mma', timezone = 'America/Denver') {
  if (!timezone) timezone = 'America/Denver';
  const millis = date(secondsSinceEpoch);
  return moment(millis).tz(timezone).format(format);
};


export const getStartOfHour = (seconds) => {
  return moment(seconds * 1000).startOf('hour').unix();
};

export const getStartOfDay = (seconds) => {
  return moment(seconds * 1000).startOf('day').unix();
};

export const getStartOfWeek = (seconds) => {
  return moment(seconds * 1000).startOf('week').unix();
};

export const getStartOfMonth = (seconds) => {
  return moment(seconds * 1000).startOf('month').unix();
};

export const getStartOfYear = (seconds) => {
  return moment(seconds * 1000).startOf('year').unix();
};

/**
 * Compute a Unix timestamp `days` in the future (from now) at the time
 * 23:59:59, adjusting for some timezone offset.
 *
 * @param {number} days Number of days in the future.
 * @param {string} timezone Timezone which defaults to 'America/Denver'.
 *
 * @returns {number} Unix timestamp.
 */
export const endOfDayFromNow = (days, timezone = 'America/Denver') => {
  const startDaySeconds = getStartOfDay(now());
  const dayInFutureSeconds = startDaySeconds + (days + 1) * DAY;
  return moment(dayInFutureSeconds * 1000)
    .tz(timezone)
    .set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 0,
    })
    .unix();
};
