import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api.js';

const DAYS = [
  { key: 0, label: 'Sunday' },
  { key: 1, label: 'Monday' },
  { key: 2, label: 'Tuesday' },
  { key: 3, label: 'Wednesday' },
  { key: 4, label: 'Thursday' },
  { key: 5, label: 'Friday' },
  { key: 6, label: 'Saturday' }
];

function to12h(value) {
  if (!value) {
    return '9:00am';
  }

  const [hourPart, minutePart] = value.split(':');
  const hour = Number(hourPart);
  const period = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutePart}${period}`;
}

function summarize(schedule) {
  if (!schedule?.windows?.length) {
    return 'No hours configured';
  }

  const sorted = [...schedule.windows].sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return `${DAYS[first.weekday].label.slice(0, 3)} - ${DAYS[last.weekday].label.slice(0, 3)}, ${to12h(first.start_time).toUpperCase()} - ${to12h(first.end_time).toUpperCase()}`;
}

export default function AvailabilityDetailPage() {
  const navigate = useNavigate();
  const { scheduleId } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true);
      setError('');

      try {
        const schedules = await api.listSchedules();
        const found = schedules.find((item) => String(item.id) === String(scheduleId));
        if (!found) {
          setError('Schedule not found.');
          setSchedule(null);
          return;
        }
        setSchedule(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
  }, [scheduleId]);

  const windowsByDay = useMemo(() => {
    const map = new Map();
    for (const day of DAYS) {
      map.set(day.key, []);
    }

    for (const window of schedule?.windows || []) {
      if (!map.has(window.weekday)) {
        map.set(window.weekday, []);
      }
      map.get(window.weekday).push(window);
    }

    for (const day of DAYS) {
      map.set(
        day.key,
        map.get(day.key).sort((a, b) => a.start_time.localeCompare(b.start_time))
      );
    }

    return map;
  }, [schedule]);

  return (
    <section className="panel availability-detail-panel">
      {loading ? <p className="muted">Loading availability...</p> : null}
      {error ? <div className="error-banner">{error}</div> : null}

      {schedule ? (
        <>
          <header className="availability-detail-head">
            <div className="availability-detail-title-wrap">
              <button type="button" className="availability-back" onClick={() => navigate('/admin/availability')}>
                ‹
              </button>
              <div>
                <h1>
                  {schedule.name} <span className="availability-edit-icon">✎</span>
                </h1>
                <p>{summarize(schedule)}</p>
              </div>
            </div>

            <div className="availability-detail-actions">
              <span className="availability-default-label">Set as default</span>
              <button type="button" className={`switch ${schedule.is_default ? 'switch-on' : ''}`} aria-label="Set as default" />
              <span className="availability-divider">|</span>
              <button type="button" className="icon-btn availability-danger">🗑</button>
              <span className="availability-divider">|</span>
              <button type="button" className="button-light">Save</button>
            </div>
          </header>

          <div className="availability-detail-grid">
            <div className="availability-editor-card">
              {DAYS.map((day) => {
                const entries = windowsByDay.get(day.key) || [];
                const primary = entries[0];
                const enabled = entries.length > 0;

                return (
                  <div key={day.key} className="availability-day-row">
                    <button
                      type="button"
                      className={`day-switch ${enabled ? 'day-switch-on' : ''}`}
                      aria-label={`Toggle ${day.label}`}
                    />
                    <span className="availability-day-name">{day.label}</span>

                    {enabled ? (
                      <>
                        <div className="time-pill">{to12h(primary.start_time)}</div>
                        <span className="time-separator">-</span>
                        <div className="time-pill">{to12h(primary.end_time)}</div>
                        <button type="button" className="availability-inline-icon" aria-label="Add time range">+</button>
                        <button type="button" className="availability-inline-icon" aria-label="Copy time range">⧉</button>
                      </>
                    ) : (
                      <span className="muted">Unavailable</span>
                    )}
                  </div>
                );
              })}
            </div>

            <aside className="availability-side-col">
              <label className="public-label">
                Timezone
                <select defaultValue={schedule.timezone}>
                  <option value={schedule.timezone}>{schedule.timezone}</option>
                </select>
              </label>

              <div className="availability-help-card">
                <h3>Something doesn&apos;t look right?</h3>
                <button type="button" className="button-ghost">Launch troubleshooter</button>
              </div>
            </aside>
          </div>

          <section className="availability-overrides-card">
            <h2>Date overrides</h2>
            <p className="muted">Add dates when your availability changes from your daily hours.</p>
            <button type="button" className="button-ghost">+ Add an override</button>
          </section>
        </>
      ) : null}
    </section>
  );
}
