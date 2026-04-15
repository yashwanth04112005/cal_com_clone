import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  installHandler,
  listInstalledHandler,
  listStoreHandler,
  uninstallHandler
} from '../controllers/apps.controller.js';

export const appsRouter = Router();

appsRouter.get('/store', asyncHandler(listStoreHandler));
appsRouter.get('/installed', asyncHandler(listInstalledHandler));
appsRouter.post('/installed', asyncHandler(installHandler));
appsRouter.delete('/installed/:appId', asyncHandler(uninstallHandler));
