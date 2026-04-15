import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { humanDateTime } from '../../lib/time.js';

export default function BookingConfirmationPage() {
  const location = useLocation();
  const { slug, bookingId } = useParams();
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState('');

  const stateBooking = location.state?.booking;
  const cachedBooking = sessionStorage.getItem(`booking-${bookingId}`);
  const booking = stateBooking || (cachedBooking ? JSON.parse(cachedBooking) : null);

  const handleCancel = async () => {
    if (!booking?.id) {
      return;
    }

    setError('');
    try {
      await api.cancelBooking(booking.id);
      setCancelled(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="booking-success-page">
      <Link to="/yashwanthpaladugula" className="back-to-bookings">
        <span>‹</span> Back to bookings
      </Link>

      <div className="confirm-card success-card">
        <div className="success-icon">✓</div>
        <h1>{cancelled ? 'This meeting has been cancelled' : 'This meeting is scheduled'}</h1>
        <p className="muted success-description">
          We sent an email with a calendar invitation with the details to everyone.
        </p>

        {!booking ? <p className="muted">Booking details are not available.</p> : null}

        {booking ? (
          <>
            <div className="success-details">
              <div className="success-row">
                <span className="success-label">What</span>
                <span>{booking.event_title} between {booking.user_name} and {booking.booker_name}</span>
              </div>
              <div className="success-row">
                <span className="success-label">When</span>
                <span>{humanDateTime(booking.start_time_utc)}<br />({booking.timezone || 'India Standard Time'})</span>
              </div>
              <div className="success-row">
                <span className="success-label">Who</span>
                <span>
                  {booking.user_name} <span className="host-badge">Host</span><br />
                  {booking.user_email}
                  <br />
                  {booking.booker_name}<br />
                  {booking.booker_email}
                </span>
              </div>
              <div className="success-row">
                <span className="success-label">Where</span>
                <span>Cal Video ↗</span>
              </div>
            </div>

            <div className="success-actions">
              <p>
                Need to make a change?{' '}
                <Link to={`/reschedule/${booking.reschedule_token}`}>Reschedule</Link>{' '}
                or{' '}
                <button type="button" className="inline-link-button" onClick={handleCancel}>
                  Cancel
                </button>
              </p>
            </div>

            {error ? <div className="error-banner">{error}</div> : null}

            <div className="calendar-add-row">
              <span>Add to calendar</span>
              <button type="button">G</button>
              <button type="button">O</button>
              <button type="button">I</button>
              <button type="button">K</button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
