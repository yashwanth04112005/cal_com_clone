import { cancelBooking, listBookings } from '../services/booking.service.js';

export async function listAll(req, res) {
  const allowedScopes = new Set(['upcoming', 'past', 'cancelled', 'unconfirmed', 'recurring']);
  const scope = allowedScopes.has(req.query.scope) ? req.query.scope : 'upcoming';
  res.json(await listBookings(scope));
}

export async function cancel(req, res) {
  res.json(await cancelBooking(Number(req.params.id)));
}
