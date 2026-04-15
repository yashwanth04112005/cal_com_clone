import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createApiKeyHandler,
  createOAuthClientHandler,
  createTeamHandler,
  createWebhookHandler,
  deleteApiKeyHandler,
  deleteOAuthClientHandler,
  deleteWebhookHandler,
  getGeneralHandler,
  getProfileHandler,
  getSecurityHandler,
  listApiKeysHandler,
  listOAuthClientsHandler,
  listTeamsHandler,
  listWebhooksHandler,
  searchSettingsHandler,
  updateGeneralHandler,
  updateProfileHandler,
  updateSecurityHandler
} from '../controllers/settings.controller.js';

export const settingsRouter = Router();

settingsRouter.get('/profile', asyncHandler(getProfileHandler));
settingsRouter.patch('/profile', asyncHandler(updateProfileHandler));

settingsRouter.get('/general', asyncHandler(getGeneralHandler));
settingsRouter.patch('/general', asyncHandler(updateGeneralHandler));

settingsRouter.get('/security', asyncHandler(getSecurityHandler));
settingsRouter.patch('/security', asyncHandler(updateSecurityHandler));

settingsRouter.get('/search', asyncHandler(searchSettingsHandler));

settingsRouter.get('/teams', asyncHandler(listTeamsHandler));
settingsRouter.post('/teams', asyncHandler(createTeamHandler));

settingsRouter.get('/webhooks', asyncHandler(listWebhooksHandler));
settingsRouter.post('/webhooks', asyncHandler(createWebhookHandler));
settingsRouter.delete('/webhooks/:id', asyncHandler(deleteWebhookHandler));

settingsRouter.get('/api-keys', asyncHandler(listApiKeysHandler));
settingsRouter.post('/api-keys', asyncHandler(createApiKeyHandler));
settingsRouter.delete('/api-keys/:id', asyncHandler(deleteApiKeyHandler));

settingsRouter.get('/oauth-clients', asyncHandler(listOAuthClientsHandler));
settingsRouter.post('/oauth-clients', asyncHandler(createOAuthClientHandler));
settingsRouter.delete('/oauth-clients/:id', asyncHandler(deleteOAuthClientHandler));
