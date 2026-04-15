import { AppError } from '../utils/errors.js';
import { installApp, listAppStore, listInstalledApps, uninstallApp } from '../services/apps.service.js';

export async function listStoreHandler(req, res) {
  res.json(await listAppStore());
}

export async function listInstalledHandler(req, res) {
  res.json(await listInstalledApps());
}

export async function installHandler(req, res) {
  const appId = Number(req.body.app_id);
  if (!Number.isFinite(appId) || appId <= 0) {
    throw new AppError('app_id must be a positive number', 400);
  }
  res.status(201).json(await installApp(appId));
}

export async function uninstallHandler(req, res) {
  res.json(await uninstallApp(Number(req.params.appId)));
}
