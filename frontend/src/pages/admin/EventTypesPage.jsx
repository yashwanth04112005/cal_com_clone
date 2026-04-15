import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api.js';
import { formatMinutes, slugPath } from '../../lib/time.js';
import EventTypeModal from '../../components/EventTypeModal.jsx';

function EventTypeRow({ eventType, onToggle }) {
  const publicPath = slugPath(eventType.slug);
  const profilePath = `/yashwanthpaladugula/${eventType.slug}`;

  return (
    <article className="event-row">
      <div className="event-row-main">
        <div className="event-title-line">
          <h3>{eventType.title}</h3>
          <span className="slug-inline">{profilePath}</span>
        </div>
        <span className="duration-chip">{formatMinutes(eventType.duration_minutes)}</span>
      </div>

      <div className="event-controls">
        {!eventType.is_active ? <span className="event-hidden-tag">Hidden</span> : null}

        <label className="switch">
          <input
            type="checkbox"
            checked={Boolean(eventType.is_active)}
            onChange={() => onToggle(eventType)}
          />
          <span className="switch-track" />
        </label>

        <a className="icon-btn icon-btn-square" href={publicPath} target="_blank" rel="noreferrer" aria-label="Open event link">
          ↗
        </a>
        <button className="icon-btn icon-btn-square" type="button" aria-label="Copy event link">
          ⛓
        </button>
        <button className="icon-btn icon-btn-square" type="button" aria-label="More actions">
          ...
        </button>
      </div>
    </article>
  );
}

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const loadEventTypes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listEventTypes();
      setEventTypes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventTypes();
  }, []);

  const filteredEventTypes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return eventTypes;
    }

    return eventTypes.filter((item) => {
      return item.title.toLowerCase().includes(query) || item.slug.toLowerCase().includes(query);
    });
  }, [eventTypes, search]);

  const handleToggle = async (eventType) => {
    try {
      await api.updateEventType(eventType.id, { is_active: !Boolean(eventType.is_active) });
      setEventTypes((current) =>
        current.map((item) =>
          item.id === eventType.id ? { ...item, is_active: !Boolean(item.is_active) } : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async (payload) => {
    try {
      await api.createEventType(payload);
      setModalOpen(false);
      await loadEventTypes();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="panel">
      <header className="panel-head">
        <div>
          <h1>Event types</h1>
          <p>Configure different events for people to book on your calendar.</p>
        </div>

        <div className="head-actions">
          <input
            className="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
          />
          <button className="button-light" type="button" onClick={() => setModalOpen(true)}>
            + New
          </button>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="event-card-list">
        {loading ? <p className="muted">Loading event types...</p> : null}

        {!loading && filteredEventTypes.length === 0 ? (
          <p className="muted">No event types found.</p>
        ) : null}

        {filteredEventTypes.map((eventType, index) => (
          <div key={eventType.id} style={{ animationDelay: `${index * 0.05}s` }} className="reveal-row">
            <EventTypeRow eventType={eventType} onToggle={handleToggle} />
          </div>
        ))}
      </div>

      <EventTypeModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </section>
  );
}
