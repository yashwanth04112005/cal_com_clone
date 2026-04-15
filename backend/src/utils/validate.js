import { AppError } from './errors.js';

export function validate(schema, payload) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new AppError('Validation failed', 400, result.error.flatten());
  }
  return result.data;
}
