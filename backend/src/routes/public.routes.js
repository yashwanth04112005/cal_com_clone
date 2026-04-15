import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createBooking, getEventType, getProfileEventTypes, getRescheduleBooking, getSlots, reschedule } from '../controllers/public.controller.js';

export const publicRouter = Router();

publicRouter.get('/event-types/:slug', asyncHandler(getEventType));
publicRouter.get('/event-types/:slug/slots', asyncHandler(getSlots));
publicRouter.post('/event-types/:slug/bookings', asyncHandler(createBooking));
publicRouter.get('/profiles/:username/event-types', asyncHandler(getProfileEventTypes));
publicRouter.get('/bookings/reschedule/:token', asyncHandler(getRescheduleBooking));
publicRouter.post('/bookings/reschedule/:token', asyncHandler(reschedule));
