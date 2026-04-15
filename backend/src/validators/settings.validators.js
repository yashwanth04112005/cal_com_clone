import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().max(190).optional(),
  username: z.string().min(3).max(120).optional(),
  bio: z.string().max(4000).optional()
});

export const updateGeneralSchema = z.object({
  language: z.string().min(2).max(64).optional(),
  timezone: z.string().min(2).max(64).optional(),
  time_format: z.enum(['12-hour', '24-hour']).optional(),
  week_start: z.enum(['Sunday', 'Monday']).optional(),
  dynamic_group_links: z.boolean().optional(),
  allow_search_engine_indexing: z.boolean().optional(),
  monthly_digest_email: z.boolean().optional(),
  prevent_impersonation_on_bookings: z.boolean().optional()
});

export const updateSecuritySchema = z.object({
  impersonation_enabled: z.boolean().optional(),
  two_factor_enabled: z.boolean().optional()
});

export const createTeamSchema = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(180),
  bio: z.string().max(4000).optional()
});

export const createWebhookSchema = z.object({
  name: z.string().min(2).max(160),
  target_url: z.string().url().max(512)
});

export const createApiKeySchema = z.object({
  name: z.string().min(2).max(160)
});

export const createOAuthClientSchema = z.object({
  name: z.string().min(2).max(160),
  redirect_uri: z.string().url().max(512)
});
