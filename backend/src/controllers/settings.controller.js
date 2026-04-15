import { validate } from '../utils/validate.js';
import {
  createApiKeySchema,
  createOAuthClientSchema,
  createTeamSchema,
  createWebhookSchema,
  updateGeneralSchema,
  updateProfileSchema,
  updateSecuritySchema
} from '../validators/settings.validators.js';
import {
  createApiKey,
  createOAuthClient,
  createTeam,
  createWebhook,
  deleteApiKey,
  deleteOAuthClient,
  deleteWebhook,
  getGeneral,
  getProfile,
  getSecurity,
  listApiKeys,
  listOAuthClients,
  listTeams,
  listWebhooks,
  searchSettings,
  updateGeneral,
  updateProfile,
  updateSecurity
} from '../services/settings.service.js';

export async function getProfileHandler(req, res) {
  res.json(await getProfile());
}

export async function updateProfileHandler(req, res) {
  const payload = validate(updateProfileSchema, req.body);
  res.json(await updateProfile(payload));
}

export async function getGeneralHandler(req, res) {
  res.json(await getGeneral());
}

export async function updateGeneralHandler(req, res) {
  const payload = validate(updateGeneralSchema, req.body);
  res.json(await updateGeneral(payload));
}

export async function getSecurityHandler(req, res) {
  res.json(await getSecurity());
}

export async function updateSecurityHandler(req, res) {
  const payload = validate(updateSecuritySchema, req.body);
  res.json(await updateSecurity(payload));
}

export async function searchSettingsHandler(req, res) {
  const query = String(req.query.q || '').trim();
  if (!query) {
    return res.json([]);
  }
  res.json(await searchSettings(query));
}

export async function listTeamsHandler(req, res) {
  res.json(await listTeams());
}

export async function createTeamHandler(req, res) {
  const payload = validate(createTeamSchema, req.body);
  res.status(201).json(await createTeam(payload));
}

export async function listWebhooksHandler(req, res) {
  res.json(await listWebhooks());
}

export async function createWebhookHandler(req, res) {
  const payload = validate(createWebhookSchema, req.body);
  res.status(201).json(await createWebhook(payload));
}

export async function deleteWebhookHandler(req, res) {
  res.json(await deleteWebhook(Number(req.params.id)));
}

export async function listApiKeysHandler(req, res) {
  res.json(await listApiKeys());
}

export async function createApiKeyHandler(req, res) {
  const payload = validate(createApiKeySchema, req.body);
  res.status(201).json(await createApiKey(payload));
}

export async function deleteApiKeyHandler(req, res) {
  res.json(await deleteApiKey(Number(req.params.id)));
}

export async function listOAuthClientsHandler(req, res) {
  res.json(await listOAuthClients());
}

export async function createOAuthClientHandler(req, res) {
  const payload = validate(createOAuthClientSchema, req.body);
  res.status(201).json(await createOAuthClient(payload));
}

export async function deleteOAuthClientHandler(req, res) {
  res.json(await deleteOAuthClient(Number(req.params.id)));
}
