import moment from 'moment';

const formatString = (n, str) => {
  const pluralStr = n > 1 ? `${str}s` : str;
  return n > 0 ? `${n} ${pluralStr}` : '';
}

export const formatCountdown = (timer) => {
  const { hours, minutes, seconds, total } = timer;
  const h = formatString(hours, 'hour');
  const m = formatString(minutes, 'minute');
  const s = formatString(seconds, 'second');
  return total > 0 ? `FREE Delivery, Next day if ordered within ${h} ${m} ${s}` : 'Loading...';
}

export const countdownDate = ({ cutOffDate }) => {
  const difference = moment(cutOffDate).diff(moment(), 'millseconds');
  const duration = moment.duration(difference);
  return {
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds(),
    total: difference,
    cutOffDate
  };
}