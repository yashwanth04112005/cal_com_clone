import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { formatMinutes } from '../../lib/time.js';

export default function PublicProfilePage() {
  const { username } = useParams();
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEventTypes() {
      setLoading(true);
      setError('');
      try {
        const data = await api.listPublicProfileEventTypes(username);
        setEventTypes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadEventTypes();
  }, [username]);

  const visibleEventTypes = useMemo(() => eventTypes, [eventTypes]);

  return (
    <div className="public-profile-page">
      <div className="public-profile-shell">
        <header className="public-profile-header">
          <img
            className="public-profile-avatar"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=220&h=220&fit=crop&crop=face"
            alt={username}
          />
          <div>
            <h1>{username === 'yashwanthpaladugula' ? 'Yashwanth Paladugula' : username}</h1>
          </div>
        </header>

        <section className="public-event-list">
          {loading ? <p className="muted">Loading event types...</p> : null}
          {error ? <div className="error-banner">{error}</div> : null}

          {!loading && visibleEventTypes.length === 0 ? (
            <p className="muted">No event types available.</p>
          ) : null}

          {visibleEventTypes.map((eventType) => (
            <Link key={eventType.id} className="public-event-item" to={`/book/${eventType.slug}`}>
              <div>
                <h2>{eventType.title}</h2>
                <span className="duration-chip">{formatMinutes(eventType.duration_minutes)}</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
