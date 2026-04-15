import { DEFAULT_USER_ID } from '../constants.js';
import { execute } from './sql.js';

export async function listAppStore() {
  return execute(
    `SELECT id, name, slug, category, description, is_featured
     FROM app_catalog
     ORDER BY is_featured DESC, name ASC`
  );
}

export async function listInstalledApps() {
  return execute(
    `SELECT ia.id, ia.installed_at, ac.id AS app_id, ac.name, ac.slug, ac.category, ac.description
     FROM installed_apps ia
     JOIN app_catalog ac ON ac.id = ia.app_id
     WHERE ia.user_id = ?
     ORDER BY ia.installed_at DESC`,
    [DEFAULT_USER_ID]
  );
}

export async function installApp(appId) {
  await execute(
    'INSERT IGNORE INTO installed_apps (user_id, app_id) VALUES (?, ?)',
    [DEFAULT_USER_ID, appId]
  );
  const rows = await execute(
    `SELECT ia.id, ia.installed_at, ac.id AS app_id, ac.name, ac.slug, ac.category, ac.description
     FROM installed_apps ia
     JOIN app_catalog ac ON ac.id = ia.app_id
     WHERE ia.user_id = ? AND ia.app_id = ?
     LIMIT 1`,
    [DEFAULT_USER_ID, appId]
  );
  return rows[0] || null;
}

export async function uninstallApp(appId) {
  await execute('DELETE FROM installed_apps WHERE user_id = ? AND app_id = ?', [DEFAULT_USER_ID, appId]);
  return { deleted: true };
}
