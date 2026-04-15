import { getReferralStats } from '../services/refer.service.js';

export async function getReferralStatsHandler(req, res) {
  res.json(await getReferralStats());
}
