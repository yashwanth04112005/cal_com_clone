import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { callHistoryHandler } from '../controllers/insights.controller.js';

export const insightsRouter = Router();

insightsRouter.get('/call-history', asyncHandler(callHistoryHandler));
