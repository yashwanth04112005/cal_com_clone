import { z } from 'zod';

const windowSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/)
});

export const createScheduleSchema = z.object({
  name: z.string().min(2),
  timezone: z.string().min(2),
  is_default: z.boolean().optional()
});

export const updateScheduleSchema = createScheduleSchema.partial();

export const replaceScheduleWindowsSchema = z.object({
  windows: z.array(windowSchema).min(1)
});

export const createOverrideSchema = z.object({
  override_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  override_type: z.enum(['block', 'custom_hours']),
  windows: z.array(z.object({
    start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
    end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/)
  })).optional()
});
