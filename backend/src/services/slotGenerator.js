import { DateTime } from 'luxon';
import { parseTimeToMinutes, minutesToTimeString } from '../utils/dateTime.js';

export function buildSlots({ date, timezone, windows, overrides, durationMinutes, bufferBeforeMinutes = 0, bufferAfterMinutes = 0, existingBookings = [] }) {
  const day = DateTime.fromISO(date, { zone: timezone }).startOf('day');
  const override = overrides.find((item) => item.override_date === date);

  if (override && override.override_type === 'block') {
    return [];
  }

  const effectiveWindows = override && override.override_type === 'custom_hours' && override.windows.length > 0
    ? override.windows
    : windows;

  const slots = [];
  const slotLength = durationMinutes + bufferBeforeMinutes + bufferAfterMinutes;

  for (const window of effectiveWindows) {
    const windowStartMinutes = parseTimeToMinutes(window.start_time);
    const windowEndMinutes = parseTimeToMinutes(window.end_time);

    for (let minute = windowStartMinutes; minute + durationMinutes <= windowEndMinutes; minute += 15) {
      const slotStart = day.plus({ minutes: minute });
      const slotEnd = slotStart.plus({ minutes: durationMinutes });
      const busyStart = slotStart.minus({ minutes: bufferBeforeMinutes });
      const busyEnd = slotEnd.plus({ minutes: bufferAfterMinutes });

      const isPast = slotStart.toUTC() < DateTime.utc();
      if (isPast) {
        continue;
      }

      const hasConflict = existingBookings.some((booking) => {
        const bookingStart = DateTime.fromSQL(booking.start_time_utc, { zone: 'utc' });
        const bookingEnd = DateTime.fromSQL(booking.end_time_utc, { zone: 'utc' });
        const bookingBusyStart = bookingStart.minus({ minutes: bufferBeforeMinutes });
        const bookingBusyEnd = bookingEnd.plus({ minutes: bufferAfterMinutes });
        return busyStart.toUTC() < bookingBusyEnd && busyEnd.toUTC() > bookingBusyStart;
      });

      if (!hasConflict) {
        slots.push({
          start_time: slotStart.toUTC().toFormat('yyyy-LL-dd HH:mm:ss'),
          end_time: slotEnd.toUTC().toFormat('yyyy-LL-dd HH:mm:ss'),
          label: slotStart.setZone(timezone).toFormat('h:mm a')
        });
      }
    }
  }

  return slots;
}

export function normalizeWindows(rows) {
  return rows.map((row) => ({
    weekday: row.weekday,
    start_time: row.start_time,
    end_time: row.end_time
  }));
}
