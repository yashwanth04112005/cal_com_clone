import { customAlphabet } from 'nanoid';
import { DEFAULT_USER_ID } from '../constants.js';
import { AppError } from '../utils/errors.js';
import { execute, withTransaction } from './sql.js';
import { uniqueSlug } from '../utils/slug.js';

const tokenAlphabet = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 22);

async function ensureUserSettings(userId = DEFAULT_USER_ID) {
  const existing = await execute('SELECT * FROM user_settings WHERE user_id = ? LIMIT 1', [userId]);
  if (existing[0]) {
    return existing[0];
  }

  const users = await execute('SELECT id, name, email FROM users WHERE id = ? LIMIT 1', [userId]);
  if (!users[0]) {
    throw new AppError('User not found', 404);
  }

  const username = uniqueSlug(users[0].email.split('@')[0]);
  await execute(
    `INSERT INTO user_settings (user_id, username, language, timezone, time_format, week_start)
     VALUES (?, ?, 'English', 'Asia/Kolkata', '12-hour', 'Sunday')`,
    [userId, username]
  );

  const created = await execute('SELECT * FROM user_settings WHERE user_id = ? LIMIT 1', [userId]);
  return created[0];
}

export async function getProfile() {
  const settings = await ensureUserSettings();
  const users = await execute('SELECT id, name, email FROM users WHERE id = ? LIMIT 1', [DEFAULT_USER_ID]);

  return {
    id: users[0].id,
    name: users[0].name,
    email: users[0].email,
    username: settings.username,
    bio: settings.bio || ''
  };
}

export async function updateProfile(payload) {
  await ensureUserSettings();

  return withTransaction(async (connection) => {
    if (payload.name !== undefined || payload.email !== undefined) {
      await connection.execute(
        `UPDATE users SET
           name = COALESCE(?, name),
           email = COALESCE(?, email)
         WHERE id = ?`,
        [payload.name || null, payload.email || null, DEFAULT_USER_ID]
      );
    }

    if (payload.username !== undefined || payload.bio !== undefined) {
      await connection.execute(
        `UPDATE user_settings SET
           username = COALESCE(?, username),
           bio = COALESCE(?, bio)
         WHERE user_id = ?`,
        [payload.username || null, payload.bio === undefined ? null : payload.bio, DEFAULT_USER_ID]
      );
    }

    const profile = await getProfile();
    return profile;
  });
}

export async function getGeneral() {
  const settings = await ensureUserSettings();
  return {
    language: settings.language,
    timezone: settings.timezone,
    time_format: settings.time_format,
    week_start: settings.week_start,
    dynamic_group_links: Boolean(settings.dynamic_group_links),
    allow_search_engine_indexing: Boolean(settings.allow_search_engine_indexing),
    monthly_digest_email: Boolean(settings.monthly_digest_email),
    prevent_impersonation_on_bookings: Boolean(settings.prevent_impersonation_on_bookings)
  };
}

export async function updateGeneral(payload) {
  await ensureUserSettings();

  await execute(
    `UPDATE user_settings SET
       language = COALESCE(?, language),
       timezone = COALESCE(?, timezone),
       time_format = COALESCE(?, time_format),
       week_start = COALESCE(?, week_start),
       dynamic_group_links = COALESCE(?, dynamic_group_links),
       allow_search_engine_indexing = COALESCE(?, allow_search_engine_indexing),
       monthly_digest_email = COALESCE(?, monthly_digest_email),
       prevent_impersonation_on_bookings = COALESCE(?, prevent_impersonation_on_bookings)
     WHERE user_id = ?`,
    [
      payload.language || null,
      payload.timezone || null,
      payload.time_format || null,
      payload.week_start || null,
      payload.dynamic_group_links === undefined ? null : Number(payload.dynamic_group_links),
      payload.allow_search_engine_indexing === undefined ? null : Number(payload.allow_search_engine_indexing),
      payload.monthly_digest_email === undefined ? null : Number(payload.monthly_digest_email),
      payload.prevent_impersonation_on_bookings === undefined ? null : Number(payload.prevent_impersonation_on_bookings),
      DEFAULT_USER_ID
    ]
  );

  return getGeneral();
}

export async function getSecurity() {
  const settings = await ensureUserSettings();
  return {
    impersonation_enabled: Boolean(settings.impersonation_enabled),
    two_factor_enabled: Boolean(settings.two_factor_enabled)
  };
}

export async function updateSecurity(payload) {
  await ensureUserSettings();

  await execute(
    `UPDATE user_settings SET
       impersonation_enabled = COALESCE(?, impersonation_enabled),
       two_factor_enabled = COALESCE(?, two_factor_enabled)
     WHERE user_id = ?`,
    [
      payload.impersonation_enabled === undefined ? null : Number(payload.impersonation_enabled),
      payload.two_factor_enabled === undefined ? null : Number(payload.two_factor_enabled),
      DEFAULT_USER_ID
    ]
  );

  return getSecurity();
}

export async function searchSettings(query) {
  const terms = `%${query.toLowerCase()}%`;
  const rows = await execute(
    `SELECT key_name AS keyName, label, path, section
     FROM (
       SELECT 'profile' AS key_name, 'Profile' AS label, '/my-account/profile' AS path, 'Personal' AS section
       UNION ALL SELECT 'general', 'General', '/my-account/general', 'Personal'
       UNION ALL SELECT 'calendars', 'Calendars', '/my-account/calendars', 'Personal'
       UNION ALL SELECT 'conferencing', 'Conferencing', '/my-account/conferencing', 'Personal'
       UNION ALL SELECT 'appearance', 'Appearance', '/my-account/appearance', 'Personal'
       UNION ALL SELECT 'out_of_office', 'Out of office', '/my-account/out-of-office', 'Personal'
       UNION ALL SELECT 'push_notifications', 'Push notifications', '/my-account/push-notifications', 'Personal'
       UNION ALL SELECT 'features', 'Features', '/my-account/features', 'Personal'
       UNION ALL SELECT 'password', 'Password', '/security/password', 'Security'
       UNION ALL SELECT 'impersonation', 'Impersonation', '/security/impersonation', 'Security'
       UNION ALL SELECT 'two_factor', 'Two factor authentication', '/security/two-factor-authentication', 'Security'
       UNION ALL SELECT 'compliance', 'Compliance', '/security/compliance', 'Security'
       UNION ALL SELECT 'billing', 'Manage billing', '/billing', 'Billing'
       UNION ALL SELECT 'plans', 'Plans', '/billing/plans', 'Billing'
       UNION ALL SELECT 'webhooks', 'Webhooks', '/developer/webhooks', 'Developer'
       UNION ALL SELECT 'oauth', 'OAuth Clients', '/developer/oauth', 'Developer'
       UNION ALL SELECT 'api_keys', 'API keys', '/developer/api-keys', 'Developer'
     ) s
     WHERE LOWER(s.label) LIKE ? OR LOWER(s.section) LIKE ? OR LOWER(s.key_name) LIKE ?
     ORDER BY s.section, s.label`,
    [terms, terms, terms]
  );

  return rows;
}

export async function listTeams() {
  return execute(
    `SELECT id, name, slug, bio, created_at, updated_at
     FROM teams
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [DEFAULT_USER_ID]
  );
}

export async function createTeam(payload) {
  const slug = uniqueSlug(payload.slug || payload.name);

  const exists = await execute(
    'SELECT id FROM teams WHERE user_id = ? AND slug = ? LIMIT 1',
    [DEFAULT_USER_ID, slug]
  );
  if (exists[0]) {
    throw new AppError('Team slug already exists', 409);
  }

  const result = await execute(
    'INSERT INTO teams (user_id, name, slug, bio) VALUES (?, ?, ?, ?)',
    [DEFAULT_USER_ID, payload.name, slug, payload.bio || null]
  );

  const rows = await execute('SELECT * FROM teams WHERE id = ? LIMIT 1', [result.insertId]);
  return rows[0] || null;
}

export async function listWebhooks() {
  return execute(
    `SELECT id, name, target_url, is_active, created_at, updated_at
     FROM webhooks
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [DEFAULT_USER_ID]
  );
}

export async function createWebhook(payload) {
  const result = await execute(
    'INSERT INTO webhooks (user_id, name, target_url, is_active) VALUES (?, ?, ?, 1)',
    [DEFAULT_USER_ID, payload.name, payload.target_url]
  );
  const rows = await execute('SELECT * FROM webhooks WHERE id = ? LIMIT 1', [result.insertId]);
  return rows[0] || null;
}

export async function deleteWebhook(id) {
  await execute('DELETE FROM webhooks WHERE id = ? AND user_id = ?', [id, DEFAULT_USER_ID]);
  return { deleted: true };
}

export async function listApiKeys() {
  return execute(
    `SELECT id, name, token, created_at, updated_at
     FROM api_keys
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [DEFAULT_USER_ID]
  );
}

export async function createApiKey(payload) {
  const token = `cal_${tokenAlphabet()}`;
  const result = await execute(
    'INSERT INTO api_keys (user_id, name, token) VALUES (?, ?, ?)',
    [DEFAULT_USER_ID, payload.name, token]
  );
  const rows = await execute('SELECT * FROM api_keys WHERE id = ? LIMIT 1', [result.insertId]);
  return rows[0] || null;
}

export async function deleteApiKey(id) {
  await execute('DELETE FROM api_keys WHERE id = ? AND user_id = ?', [id, DEFAULT_USER_ID]);
  return { deleted: true };
}

export async function listOAuthClients() {
  return execute(
    `SELECT id, name, client_id, redirect_uri, is_active, created_at, updated_at
     FROM oauth_clients
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [DEFAULT_USER_ID]
  );
}

export async function createOAuthClient(payload) {
  const clientId = `oauth_${tokenAlphabet().slice(0, 16)}`;
  const result = await execute(
    'INSERT INTO oauth_clients (user_id, name, client_id, redirect_uri, is_active) VALUES (?, ?, ?, ?, 1)',
    [DEFAULT_USER_ID, payload.name, clientId, payload.redirect_uri]
  );
  const rows = await execute('SELECT * FROM oauth_clients WHERE id = ? LIMIT 1', [result.insertId]);
  return rows[0] || null;
}

export async function deleteOAuthClient(id) {
  await execute('DELETE FROM oauth_clients WHERE id = ? AND user_id = ?', [id, DEFAULT_USER_ID]);
  return { deleted: true };
}
