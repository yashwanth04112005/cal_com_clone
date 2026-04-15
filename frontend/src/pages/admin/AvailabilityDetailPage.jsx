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
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [isDefault, setIsDefault] = useState(false);
  const [windowsByDay, setWindowsByDay] = useState({});

  const toInputTime = (value) => String(value || '09:00').slice(0, 5);

  const hydrateForm = (found) => {
    setSchedule(found);
    setTitle(found.name);
    setTimezone(found.timezone);
    setIsDefault(Boolean(found.is_default));

    const grouped = {};
    DAYS.forEach((day) => {
      grouped[day.key] = [];
    });

    (found.windows || []).forEach((window) => {
      grouped[window.weekday].push({
        start_time: toInputTime(window.start_time),
        end_time: toInputTime(window.end_time)
      });
    });

    DAYS.forEach((day) => {
      grouped[day.key] = grouped[day.key].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    setWindowsByDay(grouped);
  };

  const loadSchedule = async () => {
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
      hydrateForm(found);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [scheduleId]);

  const summarizedSchedule = useMemo(() => {
    const windows = DAYS.flatMap((day) =>
      (windowsByDay[day.key] || []).map((window) => ({
        weekday: day.key,
        start_time: window.start_time,
        end_time: window.end_time
      }))
    );

    return summarize({ windows });
  }, [windowsByDay]);

  const toggleDay = (dayKey) => {
    setWindowsByDay((current) => {
      const entries = current[dayKey] || [];
      return {
        ...current,
        [dayKey]: entries.length > 0 ? [] : [{ start_time: '09:00', end_time: '17:00' }]
      };
    });
  };

  const updateWindow = (dayKey, index, field, value) => {
    setWindowsByDay((current) => ({
      ...current,
      [dayKey]: (current[dayKey] || []).map((window, idx) =>
        idx === index ? { ...window, [field]: value } : window
      )
    }));
  };

  const addWindow = (dayKey) => {
    setWindowsByDay((current) => ({
      ...current,
      [dayKey]: [...(current[dayKey] || []), { start_time: '09:00', end_time: '17:00' }]
    }));
  };

  const removeWindow = (dayKey, index) => {
    setWindowsByDay((current) => ({
      ...current,
      [dayKey]: (current[dayKey] || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleSetDefault = async () => {
    try {
      setError('');
      await api.updateSchedule(schedule.id, { is_default: true });
      setIsDefault(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm('Delete this schedule? This cannot be undone.');
    if (!shouldDelete) {
      return;
    }

    try {
      await api.deleteSchedule(schedule.id);
      navigate('/admin/availability');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    if (!schedule) {
      return;
    }

    const windows = DAYS.flatMap((day) =>
      (windowsByDay[day.key] || []).map((window) => ({
        weekday: day.key,
        start_time: window.start_time,
        end_time: window.end_time
      }))
    );

    if (windows.length === 0) {
      setError('At least one availability window is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.updateSchedule(schedule.id, {
        name: title,
        timezone,
        is_default: isDefault
      });
      await api.replaceScheduleWindows(schedule.id, { windows });
      await loadSchedule();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
                  {title} <span className="availability-edit-icon">✎</span>
                </h1>
                <p>{summarizedSchedule}</p>
              </div>
            </div>

            <div className="availability-detail-actions">
              <span className="availability-default-label">Set as default</span>
              <button type="button" className={`switch ${isDefault ? 'switch-on' : ''}`} aria-label="Set as default" onClick={handleSetDefault} />
              <span className="availability-divider">|</span>
              <button type="button" className="icon-btn availability-danger" onClick={handleDelete}>🗑</button>
              <span className="availability-divider">|</span>
              <button type="button" className="button-light" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </header>

          <div className="availability-detail-name-edit">
            <label className="public-label">
              Schedule name
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
          </div>

          <div className="availability-detail-grid">
            <div className="availability-editor-card">
              {DAYS.map((day) => {
                const entries = windowsByDay[day.key] || [];
                const enabled = entries.length > 0;

                return (
                  <div key={day.key} className="availability-day-row">
                    <button
                      type="button"
                      className={`day-switch ${enabled ? 'day-switch-on' : ''}`}
                      aria-label={`Toggle ${day.label}`}
                      onClick={() => toggleDay(day.key)}
                    />
                    <span className="availability-day-name">{day.label}</span>

                    {enabled ? (
                      <>
                        <div className="availability-time-edit-wrap">
                          {entries.map((entry, index) => (
                            <div key={`${day.key}-${index}`} className="availability-time-edit-row">
                              <input
                                className="availability-time-input"
                                type="time"
                                value={entry.start_time}
                                onChange={(event) => updateWindow(day.key, index, 'start_time', event.target.value)}
                              />
                              <span className="time-separator">-</span>
                              <input
                                className="availability-time-input"
                                type="time"
                                value={entry.end_time}
                                onChange={(event) => updateWindow(day.key, index, 'end_time', event.target.value)}
                              />
                              <button
                                type="button"
                                className="availability-inline-icon"
                                aria-label={`Remove time range for ${day.label}`}
                                onClick={() => removeWindow(day.key, index)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <button type="button" className="availability-inline-icon" aria-label="Add time range" onClick={() => addWindow(day.key)}>+</button>
                        <span />
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
                <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="Asia/Calcutta">Asia/Calcutta</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
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
