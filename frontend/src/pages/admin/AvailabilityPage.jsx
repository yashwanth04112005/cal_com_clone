import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTimeLabel(time) {
  const [hourPart, minutePart] = time.split(':');
  const hour24 = Number(hourPart);
  const minute = minutePart;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}

function summarizeSchedule(windows) {
  if (!windows || windows.length === 0) {
    return 'No working hours set';
  }

  const sorted = [...windows].sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time));
  const firstDay = sorted[0].weekday;
  const lastDay = sorted[sorted.length - 1].weekday;
  const startTime = sorted.reduce((min, item) => (item.start_time < min ? item.start_time : min), sorted[0].start_time);
  const endTime = sorted.reduce((max, item) => (item.end_time > max ? item.end_time : max), sorted[0].end_time);
  return `${WEEKDAYS[firstDay]} - ${WEEKDAYS[lastDay]}, ${formatTimeLabel(startTime)} - ${formatTimeLabel(endTime)}`;
}

export default function AvailabilityPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSchedules() {
      setError('');
      try {
        const data = await api.listSchedules();
        setSchedules(data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadSchedules();
  }, []);

  return (
    <section className="panel">
      <header className="panel-head availability-head">
        <div>
          <h1>Availability</h1>
          <p>Configure times when you are available for bookings.</p>
        </div>

        <div className="availability-actions">
          <div className="availability-tabs" role="tablist" aria-label="Availability scope">
            <button type="button" className="availability-tab availability-tab-active">My availability</button>
            <button type="button" className="availability-tab">Team availability</button>
          </div>
          <button type="button" className="button-light">+ New</button>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="availability-stack">
        {schedules.map((schedule) => (
          <article
            className="availability-card availability-card-clickable"
            key={schedule.id}
            onClick={() => navigate(`/admin/availability/${schedule.id}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate(`/admin/availability/${schedule.id}`);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="availability-card-main">
              <div className="availability-title-row">
                <h2>{schedule.name}</h2>
                {schedule.is_default ? <span className="availability-default-pill">Default</span> : null}
              </div>
              <p className="availability-summary">{summarizeSchedule(schedule.windows)}</p>
              <p className="availability-timezone">◌ {schedule.timezone}</p>
            </div>

            <button className="availability-menu" type="button" aria-label={`More actions for ${schedule.name}`}>
              ⋯
            </button>
          </article>
        ))}
      </div>

      <p className="availability-footer-note">
        Temporarily out-of-office? <a href="#">Add a redirect</a>
      </p>
    </section>
  );
}
