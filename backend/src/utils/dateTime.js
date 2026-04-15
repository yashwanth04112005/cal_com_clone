import { DateTime } from 'luxon';

export function parseDateOnly(dateString, timezone) {
  return DateTime.fromISO(dateString, { zone: timezone });
}

export function toUtcDateTimeString(dateTime) {
  return dateTime.toUTC().toFormat('yyyy-LL-dd HH:mm:ss');
}

export function toUtcDateTimeFromLocal(dateString, timeString, timezone) {
  return DateTime.fromISO(`${dateString}T${timeString}`, { zone: timezone }).toUTC();
}

export function formatDateTimeForClient(dateTime, timezone) {
  return dateTime.setZone(timezone).toISO({ suppressMilliseconds: true });
}

export function getWeekday(dateTime) {
  return (dateTime.weekday % 7);
}

export function parseTimeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTimeString(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:00`;
}

export function addMinutesToUtcString(utcString, minutes) {
  return DateTime.fromSQL(utcString, { zone: 'utc' }).plus({ minutes }).toUTC().toFormat('yyyy-LL-dd HH:mm:ss');
}
