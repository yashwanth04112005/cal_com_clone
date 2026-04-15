import { validate } from '../utils/validate.js';
import {
  createOverrideSchema,
  createScheduleSchema,
  replaceScheduleWindowsSchema,
  updateScheduleSchema
} from '../validators/availability.validators.js';
import {
  createOverride,
  createSchedule,
  deleteOverride,
  deleteSchedule,
  listOverrides,
  listSchedules,
  replaceWindows,
  updateSchedule
} from '../services/availability.service.js';

export async function listAll(req, res) {
  res.json(await listSchedules());
}

export async function createOne(req, res) {
  const payload = validate(createScheduleSchema, {
    ...req.body,
    is_default: req.body.is_default === undefined ? false : req.body.is_default === 'true' || req.body.is_default === true
  });
  res.status(201).json(await createSchedule(payload));
}

export async function updateOne(req, res) {
  const payload = validate(updateScheduleSchema, {
    ...req.body,
    is_default: req.body.is_default === undefined ? undefined : req.body.is_default === 'true' || req.body.is_default === true
  });
  res.json(await updateSchedule(Number(req.params.id), payload));
}

export async function removeOne(req, res) {
  res.json(await deleteSchedule(Number(req.params.id)));
}

export async function replaceWindowsHandler(req, res) {
  const payload = validate(replaceScheduleWindowsSchema, {
    windows: Array.isArray(req.body.windows)
      ? req.body.windows.map((window) => ({
          weekday: Number(window.weekday),
          start_time: window.start_time,
          end_time: window.end_time
        }))
      : []
  });
  res.json(await replaceWindows(Number(req.params.id), payload.windows));
}

export async function listOverridesHandler(req, res) {
  res.json(await listOverrides(Number(req.params.id)));
}

export async function createOverrideHandler(req, res) {
  const payload = validate(createOverrideSchema, req.body);
  res.status(201).json(await createOverride(Number(req.params.id), payload));
}

export async function deleteOverrideHandler(req, res) {
  res.json(await deleteOverride(Number(req.params.overrideId)));
}
