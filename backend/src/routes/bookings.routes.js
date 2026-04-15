import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cancel, listAll } from '../controllers/bookings.controller.js';

export const bookingRouter = Router();

bookingRouter.get('/', asyncHandler(listAll));
bookingRouter.patch('/:id/cancel', asyncHandler(cancel));
