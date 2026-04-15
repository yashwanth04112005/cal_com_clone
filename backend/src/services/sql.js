import { pool } from '../config/db.js';

export async function withTransaction(work) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function execute(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function executeWithin(connection, sql, params = []) {
  const [rows] = await connection.execute(sql, params);
  return rows;
}
