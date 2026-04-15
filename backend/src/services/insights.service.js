import { DEFAULT_USER_ID } from '../constants.js';
import { execute } from './sql.js';

function toDurationLabel(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;
  return `${String(minutes).padStart(2, '0')}m ${String(remaining).padStart(2, '0')}s`;
}

function toStatusLabel(status) {
  if (status === 'no_answer') {
    return 'No answer';
  }
  if (status === 'missed') {
    return 'Missed';
  }
  return 'Answered';
}

export async function listCallHistory() {
  const rows = await execute(
    `SELECT id, contact_name, duration_seconds, status, called_at
     FROM call_history
     WHERE user_id = ?
     ORDER BY called_at DESC`,
    [DEFAULT_USER_ID]
  );

  return rows.map((row) => ({
    id: row.id,
    contact: row.contact_name,
    duration: toDurationLabel(row.duration_seconds),
    status: toStatusLabel(row.status),
    time: row.called_at
  }));
}
