import { z } from 'zod';

export const createBookingSchema = z.object({
  booker_name: z.string().min(2),
  booker_email: z.string().email(),
  start_time: z.string().min(8),
  answers: z.array(z.object({
    question_id: z.number().int().positive(),
    answer_text: z.string().min(1)
  })).optional()
});

export const rescheduleSchema = z.object({
  start_time: z.string().min(8)
});
