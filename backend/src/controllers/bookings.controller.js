import { cancelBooking, listBookings } from '../services/booking.service.js';

export async function listAll(req, res) {
  const scope = req.query.scope === 'past' ? 'past' : 'upcoming';
  res.json(await listBookings(scope));
}

export async function cancel(req, res) {
  res.json(await cancelBooking(Number(req.params.id)));
}
