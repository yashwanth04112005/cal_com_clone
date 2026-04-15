import { AppError } from '../utils/errors.js';
import { execute, executeWithin, withTransaction } from './sql.js';

export async function listQuestions(eventTypeId) {
  return execute('SELECT * FROM booking_questions WHERE event_type_id = ? ORDER BY sort_order ASC, id ASC', [eventTypeId]);
}

export async function createQuestion(eventTypeId, payload) {
  return withTransaction(async (connection) => {
    const result = await executeWithin(
      connection,
      `INSERT INTO booking_questions (event_type_id, label, question_type, is_required, options_json, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        eventTypeId,
        payload.label,
        payload.question_type,
        payload.is_required ? 1 : 0,
        payload.options_json ? JSON.stringify(payload.options_json) : null,
        payload.sort_order || 0
      ]
    );
    const rows = await executeWithin(connection, 'SELECT * FROM booking_questions WHERE id = ? LIMIT 1', [result.insertId]);
    return rows[0] || null;
  });
}

export async function getQuestionById(id) {
  const rows = await execute('SELECT * FROM booking_questions WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function updateQuestion(id, payload) {
  const question = await getQuestionById(id);
  if (!question) {
    throw new AppError('Question not found', 404);
  }

  await execute(
    `UPDATE booking_questions SET
       label = COALESCE(?, label),
       question_type = COALESCE(?, question_type),
       is_required = COALESCE(?, is_required),
       options_json = ?,
       sort_order = COALESCE(?, sort_order)
     WHERE id = ?`,
    [
      payload.label || null,
      payload.question_type || null,
      payload.is_required === undefined ? null : Number(payload.is_required),
      payload.options_json === undefined ? null : JSON.stringify(payload.options_json),
      payload.sort_order === undefined ? null : payload.sort_order,
      id
    ]
  );

  return getQuestionById(id);
}

export async function deleteQuestion(id) {
  await execute('DELETE FROM booking_questions WHERE id = ?', [id]);
  return { deleted: true };
}
