import { z } from 'zod';

const workflowBaseSchema = z.object({
  name: z.string().min(2).max(180),
  trigger_event: z.string().min(2).max(80),
  offset_value: z.number().int().min(0).max(10080),
  offset_unit: z.enum(['minutes', 'hours', 'days']),
  event_type_id: z.number().int().positive().nullable().optional(),
  action_type: z.string().min(2).max(120),
  is_active: z.boolean().optional()
});

export const createWorkflowSchema = workflowBaseSchema;

export const updateWorkflowSchema = workflowBaseSchema.partial();
