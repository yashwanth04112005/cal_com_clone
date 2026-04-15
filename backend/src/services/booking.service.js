import { DateTime } from 'luxon';
import { DEFAULT_USER_ID, BOOKING_STATUSES } from '../constants.js';
import { AppError } from '../utils/errors.js';
import { buildSlots } from './slotGenerator.js';
import { execute, executeWithin, withTransaction } from './sql.js';
import { getEventTypeBySlug } from './eventTypes.service.js';
import { getDefaultScheduleForUser, getScheduleForEventType, getWindowsForSchedule, getOverridesForSchedule } from './availability.service.js';
import { getQuestionById } from './question.service.js';
import {
  sendBookingCancellationEmails,
  sendBookingConfirmationEmails,
  sendBookingRescheduledEmails
} from './email.service.js';

async function getExistingBookingsForDate(userId, dateStartUtc, dateEndUtc) {
  return execute(
    `SELECT * FROM bookings
     WHERE user_id = ? AND status = 'confirmed' AND start_time_utc < ? AND end_time_utc > ?
     ORDER BY start_time_utc ASC`,
    [userId, dateEndUtc, dateStartUtc]
  );
}

export async function getPublicEventType(slug) {
  const eventType = await getEventTypeBySlug(slug);
  if (!eventType) {
    throw new AppError('Event type not found', 404);
  }
  const schedule = (await getScheduleForEventType(eventType.id)) || (await getDefaultScheduleForUser(eventType.user_id));
  if (!schedule) {
    throw new AppError('No availability schedule configured', 400);
  }
  const windows = await getWindowsForSchedule(schedule.id);
  const overrides = await getOverridesForSchedule(schedule.id);
  const questions = await execute('SELECT * FROM booking_questions WHERE event_type_id = ? ORDER BY sort_order ASC, id ASC', [eventType.id]);

  return {
    eventType,
    schedule,
    windows,
    overrides,
    questions
  };
}

export async function getAvailableSlots(slug, date) {
  const { eventType, schedule, windows, overrides } = await getPublicEventType(slug);
  if (!date) {
    throw new AppError('date query parameter is required', 400);
  }
  const dateTime = DateTime.fromISO(date, { zone: schedule.timezone }).startOf('day');
  const dateStartUtc = dateTime.toUTC().toFormat('yyyy-LL-dd HH:mm:ss');
  const dateEndUtc = dateTime.endOf('day').toUTC().toFormat('yyyy-LL-dd HH:mm:ss');
  const existingBookings = await getExistingBookingsForDate(eventType.user_id, dateStartUtc, dateEndUtc);

  const dayWindows = windows
    .filter((window) => window.weekday === dateTime.weekday % 7)
    .map((window) => ({ start_time: window.start_time, end_time: window.end_time }));

  const override = overrides.find((item) => item.override_date === date);
  const activeWindows = override && override.override_type === 'custom_hours' && override.windows.length > 0 ? override.windows : dayWindows;

  return buildSlots({
    date,
    timezone: schedule.timezone,
    windows: activeWindows,
    overrides,
    durationMinutes: eventType.duration_minutes,
    bufferBeforeMinutes: eventType.buffer_before_minutes,
    bufferAfterMinutes: eventType.buffer_after_minutes,
    existingBookings
  });
}

export async function createPublicBooking(slug, payload) {
  const { eventType, schedule, questions } = await getPublicEventType(slug);
  const slotStart = DateTime.fromSQL(payload.start_time, { zone: 'utc' });
  const slotEnd = slotStart.plus({ minutes: eventType.duration_minutes });
  const busyStart = slotStart.minus({ minutes: eventType.buffer_before_minutes });
  const busyEnd = slotEnd.plus({ minutes: eventType.buffer_after_minutes });
  const selectedDate = slotStart.setZone(schedule.timezone).toISODate();
  const allowedSlots = await getAvailableSlots(slug, selectedDate);

  if (!allowedSlots.some((slot) => slot.start_time === payload.start_time)) {
    throw new AppError('Selected time slot is not available', 409);
  }

  const bookingId = await withTransaction(async (connection) => {
    const conflicts = await executeWithin(
      connection,
      `SELECT id FROM bookings
       WHERE user_id = ? AND status = 'confirmed' AND start_time_utc < ? AND end_time_utc > ?
       LIMIT 1`,
      [eventType.user_id, busyEnd.toUTC().toFormat('yyyy-LL-dd HH:mm:ss'), busyStart.toUTC().toFormat('yyyy-LL-dd HH:mm:ss')]
    );

    if (conflicts.length > 0) {
      throw new AppError('Selected time slot is no longer available', 409);
    }

    const result = await executeWithin(
      connection,
      `INSERT INTO bookings
       (event_type_id, user_id, booker_name, booker_email, start_time_utc, end_time_utc, status, reschedule_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventType.id,
        eventType.user_id,
        payload.booker_name,
        payload.booker_email,
        slotStart.toUTC().toFormat('yyyy-LL-dd HH:mm:ss'),
        slotEnd.toUTC().toFormat('yyyy-LL-dd HH:mm:ss'),
        BOOKING_STATUSES.CONFIRMED,
        null
      ]
    );

    if (Array.isArray(payload.answers)) {
      for (const answer of payload.answers) {
        const question = questions.find((item) => Number(item.id) === Number(answer.question_id));
        if (!question) {
          continue;
        }
        await executeWithin(
          connection,
          'INSERT INTO booking_question_answers (booking_id, question_id, answer_text) VALUES (?, ?, ?)',
          [result.insertId, question.id, answer.answer_text]
        );
      }
    }

    const token = result.insertId.toString(36).padStart(8, '0') + DateTime.now().toMillis().toString(36).slice(0, 24);
    await executeWithin(connection, 'UPDATE bookings SET reschedule_token = ? WHERE id = ?', [token.slice(0, 32), result.insertId]);
    return result.insertId;
  });

  const booking = await getBookingById(bookingId);
  await sendBookingConfirmationEmails({ booking, hostEmail: eventType.user_email });
  return booking;
}

export async function getBookingById(id) {
  const rows = await execute(
    `SELECT b.*, et.title AS event_title, et.slug AS event_slug, et.duration_minutes, et.buffer_before_minutes, et.buffer_after_minutes, s.timezone AS timezone, u.name AS user_name, u.email AS user_email
     FROM bookings b
     JOIN event_types et ON et.id = b.event_type_id
     LEFT JOIN availability_schedules s ON s.id = et.schedule_id
     JOIN users u ON u.id = b.user_id
     WHERE b.id = ?
     LIMIT 1`,
    [id]
  );
  if (!rows[0]) {
    return null;
  }
  const answers = await execute(
    `SELECT a.*, q.label, q.question_type
     FROM booking_question_answers a
     JOIN booking_questions q ON q.id = a.question_id
     WHERE a.booking_id = ?
     ORDER BY q.sort_order ASC, q.id ASC`,
    [id]
  );
  return { ...rows[0], answers };
}

export async function listBookings(scope = 'upcoming') {
  const now = DateTime.utc().toFormat('yyyy-LL-dd HH:mm:ss');

  if (scope === 'cancelled') {
    return execute(
      `SELECT b.*, et.title AS event_title, et.slug AS event_slug
       FROM bookings b
       JOIN event_types et ON et.id = b.event_type_id
       WHERE b.user_id = ? AND b.status = 'cancelled'
       ORDER BY COALESCE(b.cancelled_at, b.updated_at, b.start_time_utc) DESC`,
      [DEFAULT_USER_ID]
    );
  }

  if (scope === 'unconfirmed') {
    return execute(
      `SELECT b.*, et.title AS event_title, et.slug AS event_slug
       FROM bookings b
       JOIN event_types et ON et.id = b.event_type_id
       WHERE b.user_id = ? AND b.status = 'unconfirmed'
       ORDER BY b.start_time_utc ASC`,
      [DEFAULT_USER_ID]
    );
  }

  if (scope === 'recurring') {
    return [];
  }

  const comparison = scope === 'past' ? '<' : '>=';
  return execute(
    `SELECT b.*, et.title AS event_title, et.slug AS event_slug
     FROM bookings b
     JOIN event_types et ON et.id = b.event_type_id
     WHERE b.user_id = ? AND b.status = 'confirmed' AND b.start_time_utc ${comparison} ?
     ORDER BY b.start_time_utc ${scope === 'past' ? 'DESC' : 'ASC'}`,
    [DEFAULT_USER_ID, now]
  );
}

export async function cancelBooking(id) {
  const booking = await getBookingById(id);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  await execute(
    `UPDATE bookings SET status = ?, cancelled_at = NOW() WHERE id = ?`,
    [BOOKING_STATUSES.CANCELLED, id]
  );

  await sendBookingCancellationEmails({ booking, hostEmail: booking.user_email });

  return { cancelled: true };
}

export async function getBookingByToken(token) {
  const rows = await execute(
    `SELECT b.*, et.title AS event_title, et.slug AS event_slug, et.duration_minutes, et.buffer_before_minutes, et.buffer_after_minutes, s.timezone AS timezone, u.name AS user_name, u.email AS user_email
     FROM bookings b
     JOIN event_types et ON et.id = b.event_type_id
     LEFT JOIN availability_schedules s ON s.id = et.schedule_id
     JOIN users u ON u.id = b.user_id
     WHERE b.reschedule_token = ?
     LIMIT 1`,
    [token]
  );
  return rows[0] || null;
}

export async function rescheduleBooking(token, payload) {
  const booking = await getBookingByToken(token);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  const publicEventType = await getPublicEventType(booking.event_slug);
  const selectedDate = DateTime.fromSQL(payload.start_time, { zone: 'utc' }).setZone(publicEventType.schedule.timezone).toISODate();
  const allowedSlots = await getAvailableSlots(booking.event_slug, selectedDate);

  if (!allowedSlots.some((slot) => slot.start_time === payload.start_time)) {
    throw new AppError('Selected time slot is not available', 409);
  }

  const slotStart = DateTime.fromSQL(payload.start_time, { zone: 'utc' });
  const slotEnd = slotStart.plus({ minutes: booking.duration_minutes });
  const busyStart = slotStart.minus({ minutes: booking.buffer_before_minutes });
  const busyEnd = slotEnd.plus({ minutes: booking.buffer_after_minutes });

  const bookingId = await withTransaction(async (connection) => {
    const conflict = await executeWithin(
      connection,
      `SELECT id FROM bookings
       WHERE user_id = ? AND status = 'confirmed' AND id <> ? AND start_time_utc < ? AND end_time_utc > ?
       LIMIT 1`,
      [booking.user_id, booking.id, busyEnd.toUTC().toFormat('yyyy-LL-dd HH:mm:ss'), busyStart.toUTC().toFormat('yyyy-LL-dd HH:mm:ss')]
    );

    if (conflict.length > 0) {
      throw new AppError('New time slot is no longer available', 409);
    }

    await executeWithin(
      connection,
      `INSERT INTO booking_reschedule_history
       (booking_id, old_start_time_utc, old_end_time_utc, new_start_time_utc, new_end_time_utc)
       VALUES (?, ?, ?, ?, ?)`,
      [booking.id, booking.start_time_utc, booking.end_time_utc, slotStart.toUTC().toFormat('yyyy-LL-dd HH:mm:ss'), slotEnd.toUTC().toFormat('yyyy-LL-dd HH:mm:ss')]
    );

    await executeWithin(
      connection,
      `UPDATE bookings SET start_time_utc = ?, end_time_utc = ?, updated_at = NOW() WHERE id = ?`,
      [slotStart.toUTC().toFormat('yyyy-LL-dd HH:mm:ss'), slotEnd.toUTC().toFormat('yyyy-LL-dd HH:mm:ss'), booking.id]
    );

    return booking.id;
  });

  const updatedBooking = await getBookingById(bookingId);
  await sendBookingRescheduledEmails({ booking: updatedBooking, hostEmail: updatedBooking.user_email });
  return updatedBooking;
}
