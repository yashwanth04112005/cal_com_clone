import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createWorkflowHandler,
  getWorkflowByIdHandler,
  listWorkflowsHandler,
  updateWorkflowHandler
} from '../controllers/workflows.controller.js';

export const workflowsRouter = Router();

workflowsRouter.get('/', asyncHandler(listWorkflowsHandler));
workflowsRouter.post('/', asyncHandler(createWorkflowHandler));
workflowsRouter.get('/:id', asyncHandler(getWorkflowByIdHandler));
workflowsRouter.patch('/:id', asyncHandler(updateWorkflowHandler));
