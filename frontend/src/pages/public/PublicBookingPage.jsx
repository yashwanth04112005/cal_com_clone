import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { isoDateToday } from '../../lib/time.js';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDateUTC(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(dateString, days) {
  const date = parseDateUTC(dateString);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addMonths(dateString, months) {
  const date = parseDateUTC(dateString);
  date.setUTCMonth(date.getUTCMonth() + months, 1);
  return date.toISOString().slice(0, 10);
}

function startOfMonth(dateString) {
  return `${dateString.slice(0, 7)}-01`;
}

function getMonthCells(dateString) {
  const date = parseDateUTC(dateString);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const startOffset = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }

  return cells;
}

function formatDateLabel(dateString) {
  const date = parseDateUTC(dateString);
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatTimeLabel(utcValue) {
  return new Intl.DateTimeFormat([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  }).format(new Date(`${utcValue.replace(' ', 'T')}Z`));
}

export default function PublicBookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDate = addDays(isoDateToday(), 1);

  const [eventData, setEventData] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(initialDate));
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookerName, setBookerName] = useState('');
  const [bookerEmail, setBookerEmail] = useState('');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const step = selectedSlot ? 'form' : 'schedule';
  const calendarCells = useMemo(() => getMonthCells(visibleMonth), [visibleMonth]);
  const monthLabel = useMemo(
    () => new Date(`${visibleMonth}T00:00:00`).toLocaleDateString([], { month: 'long', year: 'numeric' }),
    [visibleMonth]
  );
  const isPreviousMonthDisabled = useMemo(
    () => visibleMonth <= startOfMonth(isoDateToday()),
    [visibleMonth]
  );

  const loadPage = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getPublicEvent(slug);
      setEventData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (date) => {
    setError('');
    try {
      const data = await api.getPublicSlots(slug, date);
      setSlots(data.slots || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadPage();
  }, [slug]);

  useEffect(() => {
    if (!slug || !selectedDate) {
      return;
    }
    loadSlots(selectedDate);
  }, [slug, selectedDate]);

  useEffect(() => {
    const slotParam = searchParams.get('slot');
    const dateParam = searchParams.get('date');

    if (dateParam) {
      setSelectedDate(dateParam);
      setVisibleMonth(startOfMonth(dateParam));
    }

    setSelectedSlot(slotParam || '');
  }, [searchParams]);

  useEffect(() => {
    if (!selectedSlot) {
      return;
    }

    const isSelectedSlotAvailable = slots.some((slot) => slot.start_time === selectedSlot);

    if (!isSelectedSlotAvailable) {
      setSelectedSlot('');
      navigate(`/book/${slug}?date=${selectedDate}`, { replace: true });
    }
  }, [selectedSlot, slots, slug, selectedDate, navigate]);

  useEffect(() => {
    if (eventData && !searchParams.get('date')) {
      setSelectedDate(initialDate);
      setVisibleMonth(startOfMonth(initialDate));
    }
  }, [eventData, searchParams, initialDate]);

  const questions = useMemo(() => eventData?.questions || [], [eventData]);

  const selectedSlotLabel = useMemo(() => {
    if (!selectedSlot) {
      return '';
    }

    const match = slots.find((slot) => slot.start_time === selectedSlot);
    return match ? `${match.label}` : formatTimeLabel(selectedSlot);
  }, [selectedSlot, slots]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }

    const isSelectedSlotAvailable = slots.some((slot) => slot.start_time === selectedSlot);
    if (!isSelectedSlotAvailable) {
      setError('Selected slot changed. Please choose a slot again.');
      setSelectedSlot('');
      navigate(`/book/${slug}?date=${selectedDate}`, { replace: true });
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        booker_name: bookerName,
        booker_email: bookerEmail,
        start_time: selectedSlot,
        answers: questions
          .filter((question) => answers[question.id])
          .map((question) => ({
            question_id: question.id,
            answer_text: answers[question.id]
          }))
      };

      const booking = await api.createPublicBooking(slug, payload);
      sessionStorage.setItem(`booking-${booking.id}`, JSON.stringify(booking));
      navigate(`/book/${slug}/confirmation/${booking.id}`, {
        state: { booking }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot.start_time);
    navigate(`/book/${slug}?date=${selectedDate}&slot=${encodeURIComponent(slot.start_time)}`, {
      replace: true
    });
  };

  const handleBack = () => {
    setSelectedSlot('');
    navigate(`/book/${slug}?date=${selectedDate}`, { replace: true });
  };

  const handleMonthChange = (months) => {
    const nextMonth = addMonths(visibleMonth, months);
    const currentMonth = startOfMonth(isoDateToday());

    if (months < 0 && nextMonth < currentMonth) {
      return;
    }

    setVisibleMonth(nextMonth);
  };

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    setSelectedSlot('');
    setVisibleMonth(startOfMonth(dateString));
    navigate(`/book/${slug}?date=${dateString}`, { replace: true });
  };

  return (
    <div className="public-page">
      <div className={`public-card ${step === 'form' ? 'public-card-form' : 'public-card-schedule'}`}>
        {loading ? <p className="muted">Loading booking page...</p> : null}

        {eventData ? (
          <>
            <aside className="public-left">
              <span className="pill">Cal Clone</span>
              <h1>{eventData.eventType.title}</h1>
              <p>{eventData.eventType.description || 'Pick a time that works for you.'}</p>
              <p className="muted">Duration: {eventData.eventType.duration_minutes} minutes</p>
              <p className="muted">Timezone: {eventData.schedule.timezone}</p>
              {step === 'form' ? (
                <div className="public-selected-summary">
                  <div className="summary-date">{formatDateLabel(selectedDate)}</div>
                  <div className="summary-time">{selectedSlotLabel}</div>
                </div>
              ) : null}
            </aside>

            {step === 'schedule' ? (
              <>
                <section className="public-calendar-panel">
                  <div className="calendar-head">
                    <h2>{monthLabel}</h2>
                    <div className="calendar-nav">
                      <button type="button" onClick={() => handleMonthChange(-1)} disabled={isPreviousMonthDisabled} aria-label="Previous month">
                        ‹
                      </button>
                      <button type="button" onClick={() => handleMonthChange(1)} aria-label="Next month">
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="calendar-grid">
                    {WEEK_DAYS.map((day) => (
                      <span key={day} className="calendar-weekday">{day}</span>
                    ))}
                    {calendarCells.map((cell, index) => {
                      if (!cell) {
                        return <span key={`empty-${index}`} className="calendar-empty" />;
                      }

                      const isSelected = cell === selectedDate;
                      const isMuted = cell < isoDateToday();
                      const dayNumber = Number(cell.slice(-2));

                      return (
                        <button
                          key={cell}
                          type="button"
                          className={`calendar-day ${isSelected ? 'calendar-day-selected' : ''} ${isMuted ? 'calendar-day-muted' : ''}`}
                          onClick={() => handleDateSelect(cell)}
                          disabled={isMuted}
                        >
                          {dayNumber}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="public-slots-panel">
                  <div className="slots-head">
                    <h2>{new Date(`${selectedDate}T00:00:00`).toLocaleDateString([], { weekday: 'short', day: 'numeric' })}</h2>
                    <div className="time-toggle">
                      <button type="button" className="time-toggle-inactive">12h</button>
                      <button type="button" className="time-toggle-active">24h</button>
                    </div>
                  </div>

                  <div className="slot-grid slot-grid-compact">
                    {slots.length === 0 ? <p className="muted">No available slots for this date.</p> : null}
                    {slots.map((slot) => (
                      <button
                        key={slot.start_time}
                        type="button"
                        className={`slot-btn slot-btn-compact ${selectedSlot === slot.start_time ? 'slot-selected' : ''}`}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <span className="slot-dot" />
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <section className="public-right public-form-panel">
                <div className="booking-summary-top">
                  <p className="booking-summary-date">{formatDateLabel(selectedDate)}</p>
                  <p className="booking-summary-time">{selectedSlotLabel}</p>
                </div>

                <form className="booking-form" onSubmit={handleSubmit}>
                  <label className="public-label">
                    Your name *
                    <input
                      placeholder="Your name"
                      value={bookerName}
                      onChange={(event) => setBookerName(event.target.value)}
                      required
                    />
                  </label>

                  <label className="public-label">
                    Email address *
                    <input
                      type="email"
                      placeholder="Your email"
                      value={bookerEmail}
                      onChange={(event) => setBookerEmail(event.target.value)}
                      required
                    />
                  </label>

                  {questions.map((question) => (
                    <label key={question.id} className="public-label">
                      {question.label}
                      <textarea
                        rows={4}
                        value={answers[question.id] || ''}
                        onChange={(event) =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: event.target.value
                          }))
                        }
                        required={Boolean(question.is_required)}
                      />
                    </label>
                  ))}

                  <button className="add-guests-link" type="button">
                    Add guests
                  </button>

                  <p className="privacy-line">
                    By proceeding, you agree to Cal.com&apos;s Terms and Privacy Policy.
                  </p>

                  {error ? <div className="error-banner">{error}</div> : null}

                  <div className="form-actions booking-actions">
                    <button className="button-ghost" type="button" onClick={handleBack}>
                      Back
                    </button>
                    <button className="button-primary" type="submit" disabled={submitting}>
                      {submitting ? 'Booking...' : 'Confirm'}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
