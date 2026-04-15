import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { humanDateTime } from '../../lib/time.js';

function BookingTable({ title, rows, onCancel }) {
  return (
    <section className="subpanel">
      <h2>{title}</h2>
      {rows.length === 0 ? <p className="muted">No bookings</p> : null}
      {rows.map((booking) => (
        <article key={booking.id} className="booking-row">
          <div>
            <strong>{booking.event_title}</strong>
            <p>{booking.booker_name} • {booking.booker_email}</p>
            <p className="muted">{humanDateTime(booking.start_time_utc)}</p>
          </div>
          {onCancel ? (
            <button type="button" className="button-ghost" onClick={() => onCancel(booking.id)}>
              Cancel
            </button>
          ) : null}
        </article>
      ))}
    </section>
  );
}

export default function BookingsPage() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const [upcomingData, pastData] = await Promise.all([
        api.listBookings('upcoming'),
        api.listBookings('past')
      ]);
      setUpcoming(upcomingData);
      setPast(pastData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    try {
      await api.cancelBooking(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="panel">
      <header className="panel-head simple">
        <div>
          <h1>Bookings</h1>
          <p>View upcoming and past bookings.</p>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="split-grid">
        <BookingTable title="Upcoming" rows={upcoming} onCancel={handleCancel} />
        <BookingTable title="Past" rows={past} />
      </div>
    </section>
  );
}
