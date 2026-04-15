import { validate } from '../utils/validate.js';
import { createBookingSchema, rescheduleSchema } from '../validators/booking.validators.js';
import { createPublicBooking, getAvailableSlots, getBookingByToken, getPublicEventType, rescheduleBooking } from '../services/booking.service.js';
import { listPublicEventTypesByUsername } from '../services/eventTypes.service.js';

export async function getEventType(req, res) {
  res.json(await getPublicEventType(req.params.slug));
}

export async function getSlots(req, res) {
  const date = req.query.date;
  res.json({ slots: await getAvailableSlots(req.params.slug, date) });
}

export async function createBooking(req, res) {
  const payload = validate(createBookingSchema, {
    ...req.body,
    start_time: req.body.start_time,
    answers: Array.isArray(req.body.answers)
      ? req.body.answers.map((answer) => ({
          question_id: Number(answer.question_id),
          answer_text: answer.answer_text
        }))
      : undefined
  });
  res.status(201).json(await createPublicBooking(req.params.slug, payload));
}

export async function getRescheduleBooking(req, res) {
  const booking = await getBookingByToken(req.params.token);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  res.json(booking);
}

export async function reschedule(req, res) {
  const payload = validate(rescheduleSchema, { start_time: req.body.start_time });
  res.json(await rescheduleBooking(req.params.token, payload));
}

export async function getProfileEventTypes(req, res) {
  res.json(await listPublicEventTypesByUsername(req.params.username || ''));
}
