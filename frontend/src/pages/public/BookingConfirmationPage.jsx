import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { humanDateTime } from '../../lib/time.js';

function formatUtcCalendarStamp(value) {
  return value.replace(/[-:]/g, '').replace('.000', '').replace(' ', 'T') + 'Z';
}

function buildCalendarLinks(booking) {
  const title = encodeURIComponent(booking.event_title || 'Meeting');
  const details = encodeURIComponent(`Meeting with ${booking.user_name} and ${booking.booker_name}`);
  const location = encodeURIComponent('Cal Video');
  const start = formatUtcCalendarStamp(booking.start_time_utc);
  const end = formatUtcCalendarStamp(booking.end_time_utc);
  const range = `${start}/${end}`;

  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${range}&details=${details}&location=${location}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&location=${location}&startdt=${encodeURIComponent(booking.start_time_utc)}&enddt=${encodeURIComponent(booking.end_time_utc)}`,
    apple: `data:text/calendar;charset=utf-8,${encodeURIComponent(`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${booking.event_title || 'Meeting'}\nDTSTART:${start}\nDTEND:${end}\nDESCRIPTION:Meeting with ${booking.user_name} and ${booking.booker_name}\nLOCATION:Cal Video\nEND:VEVENT\nEND:VCALENDAR`)}`,
    ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${booking.event_title || 'Meeting'}\nDTSTART:${start}\nDTEND:${end}\nDESCRIPTION:Meeting with ${booking.user_name} and ${booking.booker_name}\nLOCATION:Cal Video\nEND:VEVENT\nEND:VCALENDAR`)}`
  };
}

export default function BookingConfirmationPage() {
  const location = useLocation();
  const { slug, bookingId } = useParams();
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState('');

  const stateBooking = location.state?.booking;
  const cachedBooking = sessionStorage.getItem(`booking-${bookingId}`);
  const booking = stateBooking || (cachedBooking ? JSON.parse(cachedBooking) : null);
  const calendarLinks = booking ? buildCalendarLinks(booking) : null;

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
              <a className="calendar-add-link" href={calendarLinks.google} target="_blank" rel="noreferrer" aria-label="Add to Google Calendar">
                <span aria-hidden="true">📅</span>
                Google
              </a>
              <a className="calendar-add-link" href={calendarLinks.outlook} target="_blank" rel="noreferrer" aria-label="Add to Outlook Calendar">
                <span aria-hidden="true">✉</span>
                Outlook
              </a>
              <a className="calendar-add-link" href={calendarLinks.apple} download="event.ics" aria-label="Add to Apple Calendar">
                <span aria-hidden="true"></span>
                Apple
              </a>
              <a className="calendar-add-link" href={calendarLinks.ics} download="event.ics" aria-label="Download ICS file">
                <span aria-hidden="true">⌘</span>
                ICS
              </a>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
