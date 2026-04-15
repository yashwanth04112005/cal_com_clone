import { listCallHistory } from '../services/insights.service.js';

export async function callHistoryHandler(req, res) {
  res.json(await listCallHistory());
}
