import { validate } from '../utils/validate.js';
import { createQuestion, deleteQuestion, listQuestions, updateQuestion } from '../services/question.service.js';
import { z } from 'zod';

const questionSchema = z.object({
  label: z.string().min(2),
  question_type: z.enum(['text', 'textarea', 'select', 'email', 'number']),
  is_required: z.boolean().optional(),
  options_json: z.any().optional(),
  sort_order: z.number().int().optional()
});

export async function listAll(req, res) {
  res.json(await listQuestions(Number(req.params.id)));
}

export async function createOne(req, res) {
  const payload = validate(questionSchema, {
    ...req.body,
    is_required: req.body.is_required === undefined ? false : req.body.is_required === 'true' || req.body.is_required === true,
    sort_order: req.body.sort_order === undefined ? 0 : Number(req.body.sort_order)
  });
  res.status(201).json(await createQuestion(Number(req.params.id), payload));
}

export async function updateOne(req, res) {
  const payload = validate(questionSchema.partial(), {
    ...req.body,
    is_required: req.body.is_required === undefined ? undefined : req.body.is_required === 'true' || req.body.is_required === true,
    sort_order: req.body.sort_order === undefined ? undefined : Number(req.body.sort_order)
  });
  res.json(await updateQuestion(Number(req.params.questionId), payload));
}

export async function removeOne(req, res) {
  res.json(await deleteQuestion(Number(req.params.questionId)));
}
