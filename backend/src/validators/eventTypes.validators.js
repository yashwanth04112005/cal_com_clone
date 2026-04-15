import { z } from 'zod';

export const createEventTypeSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  duration_minutes: z.number().int().positive(),
  slug: z.string().min(2).optional(),
  schedule_id: z.number().int().positive().optional().nullable(),
  is_active: z.boolean().optional(),
  buffer_before_minutes: z.number().int().min(0).optional(),
  buffer_after_minutes: z.number().int().min(0).optional()
});

export const updateEventTypeSchema = createEventTypeSchema.partial();
