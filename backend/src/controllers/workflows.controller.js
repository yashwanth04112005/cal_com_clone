import { validate } from '../utils/validate.js';
import { createWorkflowSchema, updateWorkflowSchema } from '../validators/workflows.validators.js';
import { createWorkflow, getWorkflowById, listWorkflows, updateWorkflow } from '../services/workflows.service.js';

export async function listWorkflowsHandler(req, res) {
  res.json(await listWorkflows());
}

export async function createWorkflowHandler(req, res) {
  const payload = validate(createWorkflowSchema, {
    ...req.body,
    offset_value: Number(req.body.offset_value),
    event_type_id: req.body.event_type_id ? Number(req.body.event_type_id) : null,
    is_active: req.body.is_active === undefined ? undefined : req.body.is_active === true || req.body.is_active === 'true'
  });

  res.status(201).json(await createWorkflow(payload));
}

export async function getWorkflowByIdHandler(req, res) {
  const workflow = await getWorkflowById(Number(req.params.id));
  if (!workflow) {
    return res.status(404).json({ message: 'Workflow not found' });
  }
  res.json(workflow);
}

export async function updateWorkflowHandler(req, res) {
  const payload = validate(updateWorkflowSchema, {
    ...req.body,
    offset_value: req.body.offset_value === undefined ? undefined : Number(req.body.offset_value),
    event_type_id: req.body.event_type_id === undefined ? undefined : (req.body.event_type_id ? Number(req.body.event_type_id) : null),
    is_active: req.body.is_active === undefined ? undefined : req.body.is_active === true || req.body.is_active === 'true'
  });

  res.json(await updateWorkflow(Number(req.params.id), payload));
}
