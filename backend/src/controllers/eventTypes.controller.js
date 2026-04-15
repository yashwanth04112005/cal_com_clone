import { validate } from '../utils/validate.js';
import { createEventTypeSchema, updateEventTypeSchema } from '../validators/eventTypes.validators.js';
import { createEventType, deleteEventType, getEventTypeById, listEventTypes, updateEventType } from '../services/eventTypes.service.js';

export async function list(req, res) {
  res.json(await listEventTypes());
}

export async function create(req, res) {
  const payload = validate(createEventTypeSchema, {
    ...req.body,
    duration_minutes: Number(req.body.duration_minutes),
    schedule_id: req.body.schedule_id ? Number(req.body.schedule_id) : null,
    is_active: req.body.is_active === undefined ? undefined : req.body.is_active === 'true' || req.body.is_active === true,
    buffer_before_minutes: req.body.buffer_before_minutes ? Number(req.body.buffer_before_minutes) : 0,
    buffer_after_minutes: req.body.buffer_after_minutes ? Number(req.body.buffer_after_minutes) : 0
  });
  res.status(201).json(await createEventType(payload));
}

export async function update(req, res) {
  const payload = validate(updateEventTypeSchema, {
    ...req.body,
    duration_minutes: req.body.duration_minutes === undefined ? undefined : Number(req.body.duration_minutes),
    schedule_id: req.body.schedule_id === undefined ? undefined : (req.body.schedule_id ? Number(req.body.schedule_id) : null),
    is_active: req.body.is_active === undefined ? undefined : req.body.is_active === 'true' || req.body.is_active === true,
    buffer_before_minutes: req.body.buffer_before_minutes === undefined ? undefined : Number(req.body.buffer_before_minutes),
    buffer_after_minutes: req.body.buffer_after_minutes === undefined ? undefined : Number(req.body.buffer_after_minutes)
  });
  res.json(await updateEventType(Number(req.params.id), payload));
}

export async function remove(req, res) {
  res.json(await deleteEventType(Number(req.params.id)));
}

export async function getById(req, res) {
  const eventType = await getEventTypeById(Number(req.params.id));
  if (!eventType) {
    return res.status(404).json({ message: 'Event type not found' });
  }
  res.json(eventType);
}
