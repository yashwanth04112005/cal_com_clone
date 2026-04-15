import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createOne,
  createOverrideHandler,
  deleteOverrideHandler,
  listAll,
  listOverridesHandler,
  removeOne,
  replaceWindowsHandler,
  updateOne
} from '../controllers/availability.controller.js';

export const availabilityRouter = Router();

availabilityRouter.get('/schedules', asyncHandler(listAll));
availabilityRouter.post('/schedules', asyncHandler(createOne));
availabilityRouter.patch('/schedules/:id', asyncHandler(updateOne));
availabilityRouter.delete('/schedules/:id', asyncHandler(removeOne));
availabilityRouter.put('/schedules/:id/windows', asyncHandler(replaceWindowsHandler));
availabilityRouter.get('/schedules/:id/overrides', asyncHandler(listOverridesHandler));
availabilityRouter.post('/schedules/:id/overrides', asyncHandler(createOverrideHandler));
availabilityRouter.delete('/overrides/:overrideId', asyncHandler(deleteOverrideHandler));
