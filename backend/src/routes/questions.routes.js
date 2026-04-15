import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createOne, listAll, removeOne, updateOne } from '../controllers/questions.controller.js';

export const questionRouter = Router({ mergeParams: true });

questionRouter.get('/:id/questions', asyncHandler(listAll));
questionRouter.post('/:id/questions', asyncHandler(createOne));
questionRouter.patch('/:id/questions/:questionId', asyncHandler(updateOne));
questionRouter.delete('/:id/questions/:questionId', asyncHandler(removeOne));
