import { DEFAULT_USER_ID } from '../constants.js';
import { AppError } from '../utils/errors.js';
import { execute } from './sql.js';

export async function listWorkflows() {
  return execute(
    `SELECT w.*, et.title AS event_type_title
     FROM workflows w
     LEFT JOIN event_types et ON et.id = w.event_type_id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    [DEFAULT_USER_ID]
  );
}

export async function getWorkflowById(id) {
  const rows = await execute(
    `SELECT w.*, et.title AS event_type_title
     FROM workflows w
     LEFT JOIN event_types et ON et.id = w.event_type_id
     WHERE w.user_id = ? AND w.id = ?
     LIMIT 1`,
    [DEFAULT_USER_ID, id]
  );
  return rows[0] || null;
}

export async function createWorkflow(payload) {
  const result = await execute(
    `INSERT INTO workflows
     (user_id, name, trigger_event, offset_value, offset_unit, event_type_id, action_type, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      DEFAULT_USER_ID,
      payload.name,
      payload.trigger_event,
      payload.offset_value,
      payload.offset_unit,
      payload.event_type_id || null,
      payload.action_type,
      payload.is_active === undefined ? 1 : Number(payload.is_active)
    ]
  );

  return getWorkflowById(result.insertId);
}

export async function updateWorkflow(id, payload) {
  const existing = await getWorkflowById(id);
  if (!existing) {
    throw new AppError('Workflow not found', 404);
  }

  await execute(
    `UPDATE workflows SET
       name = COALESCE(?, name),
       trigger_event = COALESCE(?, trigger_event),
       offset_value = COALESCE(?, offset_value),
       offset_unit = COALESCE(?, offset_unit),
       event_type_id = ?,
       action_type = COALESCE(?, action_type),
       is_active = COALESCE(?, is_active)
     WHERE id = ? AND user_id = ?`,
    [
      payload.name || null,
      payload.trigger_event || null,
      payload.offset_value === undefined ? null : payload.offset_value,
      payload.offset_unit || null,
      payload.event_type_id === undefined ? existing.event_type_id : payload.event_type_id,
      payload.action_type || null,
      payload.is_active === undefined ? null : Number(payload.is_active),
      id,
      DEFAULT_USER_ID
    ]
  );

  return getWorkflowById(id);
}
