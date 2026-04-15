import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api.js';
import { humanDateTime } from '../../lib/time.js';

const SCOPES = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'unconfirmed', label: 'Unconfirmed', disabled: true },
  { key: 'recurring', label: 'Recurring', disabled: true },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Canceled', disabled: true }
];

function toUtcDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const isoValue = /Z$|[+-]\d\d:\d\d$/.test(normalized) ? normalized : `${normalized}Z`;
    const parsed = new Date(isoValue);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }

    const fallback = new Date(normalized);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback;
    }
  }

  return null;
}

function formatDate(value) {
  const date = toUtcDate(value);
  if (!date) {
    return '-';
  }

  return date.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

function formatTimeRange(start, end) {
  const startDate = toUtcDate(start);
  const endDate = toUtcDate(end);

  if (!startDate || !endDate) {
    return '-';
  }

  return `${startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()} - ${endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()}`;
}

function durationMinutes(start, end) {
  const startDate = toUtcDate(start);
  const endDate = toUtcDate(end);

  if (!startDate || !endDate) {
    return 0;
  }

  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.round(diff / 60000));
}

export default function BookingsPage() {
  const [activeScope, setActiveScope] = useState('upcoming');
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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

  const rows = useMemo(() => {
    if (activeScope === 'past') {
      return past;
    }
    if (activeScope === 'upcoming') {
      return upcoming;
    }
    return [];
  }, [activeScope, past, upcoming]);

  const totalRows = rows.length;

  return (
    <section className="panel">
      <div className="bookings-toolbar">
        <div className="bookings-left-tools">
          <div className="bookings-scope-tabs" role="tablist" aria-label="Booking scopes">
            {SCOPES.map((scope) => (
              <button
                key={scope.key}
                type="button"
                className={`bookings-scope-tab ${activeScope === scope.key ? 'bookings-scope-tab-active' : ''}`}
                onClick={() => !scope.disabled && setActiveScope(scope.key)}
                disabled={scope.disabled}
              >
                {scope.label}
              </button>
            ))}
          </div>
          <button type="button" className="bookings-filter-btn">Filter</button>
        </div>

        <div className="bookings-right-tools">
          <button type="button" className="bookings-filter-btn">Saved filters v</button>
          <button type="button" className="bookings-icon-btn" aria-label="View options">|||</button>
          <button type="button" className="bookings-icon-btn" aria-label="Calendar view">[]</button>
        </div>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <section className="bookings-board">
        <p className="bookings-group-title">NEXT</p>

        {loading ? <p className="muted">Loading bookings...</p> : null}
        {!loading && rows.length === 0 ? (
          <p className="muted">
            {activeScope === 'upcoming' || activeScope === 'past'
              ? 'No bookings found for this scope.'
              : 'This tab is coming soon.'}
          </p>
        ) : null}

        {rows.map((booking) => (
          <article key={booking.id} className="bookings-row-card">
            <div className="bookings-row-left">
              <p className="bookings-row-date">{formatDate(booking.start_time_utc)}</p>
              <p className="bookings-row-time">{formatTimeRange(booking.start_time_utc, booking.end_time_utc)}</p>
              <p className="bookings-row-link">Join Cal Video</p>
            </div>

            <div className="bookings-row-center">
              <p className="bookings-row-title">
                {durationMinutes(booking.start_time_utc, booking.end_time_utc)} min meeting between {booking.booker_name} and You
              </p>
              <p className="bookings-row-subtitle">You and {booking.booker_name}</p>
              <p className="muted bookings-row-meta">{humanDateTime(booking.start_time_utc)}</p>
            </div>

            <div className="bookings-row-actions">
              {activeScope === 'upcoming' ? (
                <button type="button" className="bookings-cancel-btn" onClick={() => handleCancel(booking.id)}>
                  Cancel
                </button>
              ) : null}
              <button type="button" className="bookings-more-btn" aria-label="Booking actions">...</button>
            </div>
          </article>
        ))}

        <footer className="bookings-board-footer">
          <div className="bookings-page-size">
            <button type="button" className="bookings-page-size-btn">10 v</button>
            <span>rows per page</span>
          </div>
          <div className="bookings-pagination">
            <span>{totalRows === 0 ? '0-0 of 0' : `1-${totalRows} of ${totalRows}`}</span>
            <button type="button" className="bookings-page-nav" aria-label="Previous page">&lt;</button>
            <button type="button" className="bookings-page-nav" aria-label="Next page">&gt;</button>
          </div>
        </footer>
      </section>
    </section>
  );
}
