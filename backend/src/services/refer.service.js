import { DEFAULT_USER_ID } from '../constants.js';
import { execute } from './sql.js';

export async function getReferralStats() {
  const rows = await execute(
    `SELECT referral_code, total_clicks, total_signups, total_payout_cents
     FROM referral_stats
     WHERE user_id = ?
     LIMIT 1`,
    [DEFAULT_USER_ID]
  );

  return rows[0] || {
    referral_code: '',
    total_clicks: 0,
    total_signups: 0,
    total_payout_cents: 0
  };
}
