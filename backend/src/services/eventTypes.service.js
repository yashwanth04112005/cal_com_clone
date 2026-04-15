import { AppError } from '../utils/errors.js';
import { uniqueSlug } from '../utils/slug.js';
import { DEFAULT_USER_ID } from '../constants.js';
import { execute, executeWithin, withTransaction } from './sql.js';
import { getDefaultScheduleForUser } from './availability.service.js';

export async function listEventTypes() {
  return execute(
    `SELECT et.*, s.name AS schedule_name, s.timezone
     FROM event_types et
     LEFT JOIN availability_schedules s ON s.id = et.schedule_id
     WHERE et.user_id = ? AND et.deleted_at IS NULL
     ORDER BY et.created_at DESC`,
    [DEFAULT_USER_ID]
  );
}

export async function getEventTypeById(id) {
  const rows = await execute(
    `SELECT et.*, s.name AS schedule_name, s.timezone
     FROM event_types et
     LEFT JOIN availability_schedules s ON s.id = et.schedule_id
     WHERE et.id = ? AND et.deleted_at IS NULL AND et.user_id = ?
     LIMIT 1`,
    [id, DEFAULT_USER_ID]
  );
  return rows[0] || null;
}

export async function getEventTypeBySlug(slug) {
  const rows = await execute(
    `SELECT et.*, s.name AS schedule_name, s.timezone, u.name AS user_name, u.email AS user_email
     FROM event_types et
     JOIN users u ON u.id = et.user_id
     LEFT JOIN availability_schedules s ON s.id = et.schedule_id
     WHERE et.slug = ? AND et.deleted_at IS NULL AND et.user_id = ?
     LIMIT 1`,
    [slug, DEFAULT_USER_ID]
  );
  return rows[0] || null;
}

export async function createEventType(payload) {
  const slug = payload.slug ? uniqueSlug(payload.slug) : uniqueSlug(payload.title);
  const scheduleId = payload.schedule_id ?? (await getDefaultScheduleForUser())?.id ?? null;

  return withTransaction(async (connection) => {
    const existing = await executeWithin(
      connection,
      'SELECT id FROM event_types WHERE user_id = ? AND slug = ? AND deleted_at IS NULL LIMIT 1',
      [DEFAULT_USER_ID, slug]
    );

    if (existing.length > 0) {
      throw new AppError('Slug already exists', 409);
    }

    const result = await executeWithin(
      connection,
      `INSERT INTO event_types
       (user_id, schedule_id, title, description, duration_minutes, slug, is_active, buffer_before_minutes, buffer_after_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        DEFAULT_USER_ID,
        scheduleId,
        payload.title,
        payload.description || null,
        payload.duration_minutes,
        slug,
        payload.is_active === undefined ? 1 : Number(payload.is_active),
        payload.buffer_before_minutes || 0,
        payload.buffer_after_minutes || 0
      ]
    );

    const rows = await executeWithin(
      connection,
      `SELECT et.*, s.name AS schedule_name, s.timezone
       FROM event_types et
       LEFT JOIN availability_schedules s ON s.id = et.schedule_id
       WHERE et.id = ? AND et.user_id = ? AND et.deleted_at IS NULL
       LIMIT 1`,
      [result.insertId, DEFAULT_USER_ID]
    );
    return rows[0] || null;
  });
}

export async function updateEventType(id, payload) {
  const current = await getEventTypeById(id);
  if (!current) {
    throw new AppError('Event type not found', 404);
  }

  const nextSlug = payload.slug ? uniqueSlug(payload.slug) : current.slug;

  return withTransaction(async (connection) => {
    if (nextSlug !== current.slug) {
      const duplicate = await executeWithin(
        connection,
        'SELECT id FROM event_types WHERE user_id = ? AND slug = ? AND id <> ? AND deleted_at IS NULL LIMIT 1',
        [DEFAULT_USER_ID, nextSlug, id]
      );
      if (duplicate.length > 0) {
        throw new AppError('Slug already exists', 409);
      }
    }

    await executeWithin(
      connection,
      `UPDATE event_types SET
         title = COALESCE(?, title),
         description = ?,
         duration_minutes = COALESCE(?, duration_minutes),
         slug = ?,
         schedule_id = ?,
         is_active = COALESCE(?, is_active),
         buffer_before_minutes = COALESCE(?, buffer_before_minutes),
         buffer_after_minutes = COALESCE(?, buffer_after_minutes)
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [
        payload.title || null,
        payload.description === undefined ? current.description : payload.description,
        payload.duration_minutes || null,
        nextSlug,
        payload.schedule_id === undefined ? current.schedule_id : payload.schedule_id,
        payload.is_active === undefined ? null : Number(payload.is_active),
        payload.buffer_before_minutes === undefined ? null : payload.buffer_before_minutes,
        payload.buffer_after_minutes === undefined ? null : payload.buffer_after_minutes,
        id,
        DEFAULT_USER_ID
      ]
    );

    const rows = await executeWithin(
      connection,
      `SELECT et.*, s.name AS schedule_name, s.timezone
       FROM event_types et
       LEFT JOIN availability_schedules s ON s.id = et.schedule_id
       WHERE et.id = ? AND et.user_id = ? AND et.deleted_at IS NULL
       LIMIT 1`,
      [id, DEFAULT_USER_ID]
    );
    return rows[0] || null;
  });
}

export async function deleteEventType(id) {
  const current = await getEventTypeById(id);
  if (!current) {
    throw new AppError('Event type not found', 404);
  }

  await execute('UPDATE event_types SET deleted_at = NOW() WHERE id = ? AND user_id = ?', [id, DEFAULT_USER_ID]);
  return { deleted: true };
}
