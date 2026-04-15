import { AppError } from '../utils/errors.js';
import { DEFAULT_USER_ID } from '../constants.js';
import { execute, executeWithin, withTransaction } from './sql.js';

export async function listSchedules() {
  const schedules = await execute(
    `SELECT * FROM availability_schedules
     WHERE user_id = ?
     ORDER BY is_default DESC, created_at DESC`,
    [DEFAULT_USER_ID]
  );

  const windows = await execute(
    `SELECT * FROM availability_windows
     WHERE schedule_id IN (SELECT id FROM availability_schedules WHERE user_id = ?)` ,
    [DEFAULT_USER_ID]
  );

  const overrides = await execute(
    `SELECT o.*, w.start_time, w.end_time
     FROM availability_date_overrides o
     LEFT JOIN availability_override_windows w ON w.override_id = o.id
     WHERE o.schedule_id IN (SELECT id FROM availability_schedules WHERE user_id = ?)
     ORDER BY o.override_date ASC, w.start_time ASC`,
    [DEFAULT_USER_ID]
  );

  return schedules.map((schedule) => ({
    ...schedule,
    windows: windows.filter((window) => window.schedule_id === schedule.id),
    overrides: groupOverrides(overrides.filter((override) => override.schedule_id === schedule.id))
  }));
}

function groupOverrides(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        schedule_id: row.schedule_id,
        override_date: row.override_date,
        override_type: row.override_type,
        windows: []
      });
    }
    if (row.start_time && row.end_time) {
      map.get(row.id).windows.push({ start_time: row.start_time, end_time: row.end_time });
    }
  }
  return Array.from(map.values());
}

export async function createSchedule(payload) {
  return withTransaction(async (connection) => {
    if (payload.is_default) {
      await executeWithin(connection, 'UPDATE availability_schedules SET is_default = 0 WHERE user_id = ?', [DEFAULT_USER_ID]);
    }

    const result = await executeWithin(
      connection,
      'INSERT INTO availability_schedules (user_id, name, timezone, is_default) VALUES (?, ?, ?, ?)',
      [DEFAULT_USER_ID, payload.name, payload.timezone, payload.is_default ? 1 : 0]
    );

    const rows = await executeWithin(connection, 'SELECT * FROM availability_schedules WHERE id = ? AND user_id = ? LIMIT 1', [result.insertId, DEFAULT_USER_ID]);
    return rows[0] || null;
  });
}

export async function getScheduleById(id) {
  const schedules = await execute('SELECT * FROM availability_schedules WHERE id = ? AND user_id = ? LIMIT 1', [id, DEFAULT_USER_ID]);
  return schedules[0] || null;
}

export async function updateSchedule(id, payload) {
  const schedule = await getScheduleById(id);
  if (!schedule) {
    throw new AppError('Schedule not found', 404);
  }

  return withTransaction(async (connection) => {
    if (payload.is_default) {
      await executeWithin(connection, 'UPDATE availability_schedules SET is_default = 0 WHERE user_id = ?', [DEFAULT_USER_ID]);
    }

    await executeWithin(
      connection,
      `UPDATE availability_schedules SET
         name = COALESCE(?, name),
         timezone = COALESCE(?, timezone),
         is_default = COALESCE(?, is_default)
       WHERE id = ? AND user_id = ?`,
      [
        payload.name || null,
        payload.timezone || null,
        payload.is_default === undefined ? null : Number(payload.is_default),
        id,
        DEFAULT_USER_ID
      ]
    );

    const rows = await executeWithin(connection, 'SELECT * FROM availability_schedules WHERE id = ? AND user_id = ? LIMIT 1', [id, DEFAULT_USER_ID]);
    return rows[0] || null;
  });
}

export async function deleteSchedule(id) {
  const schedule = await getScheduleById(id);
  if (!schedule) {
    throw new AppError('Schedule not found', 404);
  }
  await execute('DELETE FROM availability_schedules WHERE id = ? AND user_id = ?', [id, DEFAULT_USER_ID]);
  return { deleted: true };
}

export async function replaceWindows(scheduleId, windows) {
  const schedule = await getScheduleById(scheduleId);
  if (!schedule) {
    throw new AppError('Schedule not found', 404);
  }

  return withTransaction(async (connection) => {
    await executeWithin(connection, 'DELETE FROM availability_windows WHERE schedule_id = ?', [scheduleId]);
    for (const window of windows) {
      await executeWithin(
        connection,
        'INSERT INTO availability_windows (schedule_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?)',
        [scheduleId, window.weekday, window.start_time, window.end_time]
      );
    }
    return getWindowsByScheduleId(scheduleId);
  });
}

export async function getWindowsByScheduleId(scheduleId) {
  return execute('SELECT * FROM availability_windows WHERE schedule_id = ? ORDER BY weekday ASC, start_time ASC', [scheduleId]);
}

export async function listOverrides(scheduleId) {
  const overrides = await execute(
    `SELECT o.*, w.start_time, w.end_time
     FROM availability_date_overrides o
     LEFT JOIN availability_override_windows w ON w.override_id = o.id
     WHERE o.schedule_id = ?
     ORDER BY o.override_date ASC, w.start_time ASC`,
    [scheduleId]
  );
  return groupOverrides(overrides);
}

export async function createOverride(scheduleId, payload) {
  const schedule = await getScheduleById(scheduleId);
  if (!schedule) {
    throw new AppError('Schedule not found', 404);
  }

  return withTransaction(async (connection) => {
    const result = await executeWithin(
      connection,
      'INSERT INTO availability_date_overrides (schedule_id, override_date, override_type) VALUES (?, ?, ?)',
      [scheduleId, payload.override_date, payload.override_type]
    );

    if (payload.override_type === 'custom_hours' && Array.isArray(payload.windows)) {
      for (const window of payload.windows) {
        await executeWithin(
          connection,
          'INSERT INTO availability_override_windows (override_id, start_time, end_time) VALUES (?, ?, ?)',
          [result.insertId, window.start_time, window.end_time]
        );
      }
    }

    const rows = await executeWithin(
      connection,
      `SELECT o.*, w.start_time, w.end_time
       FROM availability_date_overrides o
       LEFT JOIN availability_override_windows w ON w.override_id = o.id
       WHERE o.id = ?
       ORDER BY w.start_time ASC`,
      [result.insertId]
    );
    const grouped = groupOverrides(rows);
    return grouped[0] || null;
  });
}

export async function getOverrideById(id) {
  const rows = await execute(
    `SELECT o.*, w.start_time, w.end_time
     FROM availability_date_overrides o
     LEFT JOIN availability_override_windows w ON w.override_id = o.id
     WHERE o.id = ?
     ORDER BY w.start_time ASC`,
    [id]
  );
  const grouped = groupOverrides(rows);
  return grouped[0] || null;
}

export async function deleteOverride(id) {
  await execute('DELETE FROM availability_date_overrides WHERE id = ?', [id]);
  return { deleted: true };
}

export async function getScheduleForEventType(eventTypeId) {
  const rows = await execute(
    `SELECT s.*
     FROM event_types et
     JOIN availability_schedules s ON s.id = et.schedule_id
     WHERE et.id = ? AND et.deleted_at IS NULL
     LIMIT 1`,
    [eventTypeId]
  );
  return rows[0] || null;
}

export async function getDefaultScheduleForUser(userId = DEFAULT_USER_ID) {
  const rows = await execute(
    `SELECT * FROM availability_schedules
     WHERE user_id = ?
     ORDER BY is_default DESC, created_at ASC
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function getWindowsForSchedule(scheduleId) {
  return execute('SELECT * FROM availability_windows WHERE schedule_id = ? ORDER BY weekday ASC, start_time ASC', [scheduleId]);
}

export async function getOverridesForSchedule(scheduleId) {
  const rows = await execute(
    `SELECT o.*, w.start_time, w.end_time
     FROM availability_date_overrides o
     LEFT JOIN availability_override_windows w ON w.override_id = o.id
     WHERE o.schedule_id = ?
     ORDER BY o.override_date ASC, w.start_time ASC`,
    [scheduleId]
  );
  return groupOverrides(rows);
}
