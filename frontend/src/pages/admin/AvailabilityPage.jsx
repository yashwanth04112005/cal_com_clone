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
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: 'New Schedule',
    timezone: 'Asia/Kolkata',
    is_default: false
  });

  const loadSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listSchedules();
      setSchedules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleCreateSchedule = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError('');

    try {
      const created = await api.createSchedule(newSchedule);
      await api.replaceScheduleWindows(created.id, {
        windows: [
          { weekday: 1, start_time: '09:00', end_time: '17:00' },
          { weekday: 2, start_time: '09:00', end_time: '17:00' },
          { weekday: 3, start_time: '09:00', end_time: '17:00' },
          { weekday: 4, start_time: '09:00', end_time: '17:00' },
          { weekday: 5, start_time: '09:00', end_time: '17:00' }
        ]
      });
      setShowCreateForm(false);
      await loadSchedules();
      navigate(`/admin/availability/${created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

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
          <button type="button" className="button-light" onClick={() => setShowCreateForm((current) => !current)}>+ New</button>
        </div>
      </header>

      {showCreateForm ? (
        <form className="availability-create-form" onSubmit={handleCreateSchedule}>
          <input
            value={newSchedule.name}
            onChange={(event) => setNewSchedule((current) => ({ ...current, name: event.target.value }))}
            placeholder="Schedule name"
            required
          />
          <select
            value={newSchedule.timezone}
            onChange={(event) => setNewSchedule((current) => ({ ...current, timezone: event.target.value }))}
          >
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
          <label className="availability-create-default">
            <input
              type="checkbox"
              checked={newSchedule.is_default}
              onChange={(event) => setNewSchedule((current) => ({ ...current, is_default: event.target.checked }))}
            />
            Set as default
          </label>
          <button className="button-primary" type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      ) : null}

      {error ? <div className="error-banner">{error}</div> : null}

      {loading ? <p className="muted">Loading schedules...</p> : null}

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
