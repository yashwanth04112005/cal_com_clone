import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { create, getById, list, remove, update } from '../controllers/eventTypes.controller.js';

export const eventTypeRouter = Router();

eventTypeRouter.get('/', asyncHandler(list));
eventTypeRouter.post('/', asyncHandler(create));
eventTypeRouter.get('/:id', asyncHandler(getById));
eventTypeRouter.patch('/:id', asyncHandler(update));
eventTypeRouter.delete('/:id', asyncHandler(remove));
