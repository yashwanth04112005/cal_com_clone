import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { humanDateTime, isoDateToday } from '../../lib/time.js';

export default function ReschedulePage() {
  const { token } = useParams();

  const [booking, setBooking] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(isoDateToday());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadBooking() {
      setError('');
      try {
        const data = await api.getRescheduleBooking(token);
        setBooking(data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadBooking();
  }, [token]);

  useEffect(() => {
    async function loadSlots() {
      if (!booking) {
        return;
      }
      setError('');
      try {
        const data = await api.getPublicSlots(booking.event_slug, selectedDate);
        setSlots(data.slots || []);
      } catch (err) {
        setError(err.message);
      }
    }

    loadSlots();
  }, [booking, selectedDate]);

  const handleReschedule = async () => {
    if (!selectedSlot) {
      setError('Select a slot to continue.');
      return;
    }

    setError('');
    setMessage('');

    try {
      const data = await api.rescheduleBooking(token, { start_time: selectedSlot });
      setMessage(`Rescheduled to ${humanDateTime(data.start_time_utc)}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="public-page">
      <div className="confirm-card">
        <h1>Reschedule booking</h1>

        {booking ? <p className="muted">Current: {humanDateTime(booking.start_time_utc)}</p> : null}

        <label className="public-label">
          New date
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>

        <div className="slot-grid">
          {slots.map((slot) => (
            <button
              key={slot.start_time}
              type="button"
              className={`slot-btn ${selectedSlot === slot.start_time ? 'slot-selected' : ''}`}
              onClick={() => setSelectedSlot(slot.start_time)}
            >
              {slot.label}
            </button>
          ))}
        </div>

        {error ? <div className="error-banner">{error}</div> : null}
        {message ? <div className="success-banner">{message}</div> : null}

        <button className="button-primary" type="button" onClick={handleReschedule}>
          Confirm new time
        </button>
      </div>
    </div>
  );
}
