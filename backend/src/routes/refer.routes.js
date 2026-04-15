import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getReferralStatsHandler } from '../controllers/refer.controller.js';

export const referRouter = Router();

referRouter.get('/stats', asyncHandler(getReferralStatsHandler));
