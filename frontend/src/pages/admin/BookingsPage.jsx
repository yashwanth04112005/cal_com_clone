import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { humanDateTime } from '../../lib/time.js';

const SCOPES = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'unconfirmed', label: 'Unconfirmed' },
  { key: 'recurring', label: 'Recurring' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Canceled' }
];

const VALID_SCOPES = new Set(SCOPES.map((scope) => scope.key));
const FILTER_OPTIONS = ['Event Type', 'Team', 'Member', 'Attendees Name', 'Attendee Email', 'Date Range', 'Booking UID'];
const BOOKING_META_STORAGE_KEY = 'bookings_meta_state_v1';

const EMPTY_STATE_COPY = {
  upcoming: {
    title: 'No upcoming bookings',
    description: 'You have no upcoming bookings. New bookings will show up here.'
  },
  unconfirmed: {
    title: 'No unconfirmed bookings',
    description: 'You have no unconfirmed bookings. Your unconfirmed bookings will show up here.'
  },
  recurring: {
    title: 'No recurring bookings',
    description: 'You have no recurring bookings. Your recurring bookings will show up here.'
  },
  past: {
    title: 'No past bookings',
    description: 'You have no past bookings yet.'
  },
  cancelled: {
    title: 'No canceled bookings',
    description: 'Canceled bookings will appear here.'
  }
};

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

function toDayKey(value) {
  const date = toUtcDate(value);
  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDayHeader(dayKey) {
  const todayKey = toDayKey(new Date());
  if (dayKey === todayKey) {
    return 'TODAY';
  }

  const [year, month, day] = dayKey.split('-');
  const dayDate = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(dayDate.getTime())) {
    return dayKey;
  }

  return dayDate.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).toUpperCase();
}

function EmptyState({ scope }) {
  const copy = EMPTY_STATE_COPY[scope] || EMPTY_STATE_COPY.upcoming;

  return (
    <div className="bookings-empty-state">
      <div className="bookings-empty-icon" aria-hidden="true">◷</div>
      <p className="bookings-empty-title">{copy.title}</p>
      <p className="bookings-empty-description">{copy.description}</p>
    </div>
  );
}

function parseDateRange(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  const toSplit = trimmed.split(/\s+to\s+/i);
  if (toSplit.length !== 2) {
    return null;
  }

  const start = new Date(`${toSplit[0]}T00:00:00`);
  const end = new Date(`${toSplit[1]}T23:59:59`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return { start, end };
}

function startOfWeekSunday(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function addDays(value, amount) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function formatRangeLabel(weekStart) {
  const weekEnd = addDays(weekStart, 6);
  return `${weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function formatDayHeading(date) {
  return {
    weekday: date.toLocaleDateString([], { weekday: 'short' }).toUpperCase(),
    day: date.toLocaleDateString([], { day: 'numeric' })
  };
}

function timezoneLabel() {
  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, '0');
  const minutes = String(absolute % 60).padStart(2, '0');
  return `GMT ${sign}${hours}:${minutes}`;
}

function filterMatchesBooking(booking, filter, bookingMeta) {
  const value = String(filter.value || '').trim().toLowerCase();
  if (!value) {
    return true;
  }

  const meta = bookingMeta[booking.id] || {};
  const memberName = (booking.user_name || 'You').toLowerCase();
  const teamName = (meta.teamName || 'Personal').toLowerCase();

  if (filter.field === 'Event Type') {
    return String(booking.event_title || '').toLowerCase().includes(value);
  }

  if (filter.field === 'Team') {
    return teamName.includes(value);
  }

  if (filter.field === 'Member') {
    return memberName.includes(value);
  }

  if (filter.field === 'Attendees Name') {
    return String(booking.booker_name || '').toLowerCase().includes(value);
  }

  if (filter.field === 'Attendee Email') {
    return String(booking.booker_email || '').toLowerCase().includes(value);
  }

  if (filter.field === 'Booking UID') {
    return String(booking.id || '').toLowerCase().includes(value);
  }

  if (filter.field === 'Date Range') {
    const parsed = parseDateRange(filter.value);
    if (!parsed) {
      return true;
    }
    const bookingStart = toUtcDate(booking.start_time_utc);
    if (!bookingStart) {
      return false;
    }
    return bookingStart >= parsed.start && bookingStart <= parsed.end;
  }

  return true;
}

export default function BookingsPage() {
  const navigate = useNavigate();
  const { scope: scopeParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeScope, setActiveScope] = useState('upcoming');
  const [bookingsByScope, setBookingsByScope] = useState({
    upcoming: [],
    unconfirmed: [],
    recurring: [],
    past: [],
    cancelled: []
  });
  const [loadedScopes, setLoadedScopes] = useState({
    upcoming: false,
    unconfirmed: false,
    recurring: false,
    past: false,
    cancelled: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingScope, setLoadingScope] = useState('');
  const [openMenuBookingId, setOpenMenuBookingId] = useState(null);
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilterField, setSelectedFilterField] = useState('Event Type');
  const [filterDraftValue, setFilterDraftValue] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [bookingMeta, setBookingMeta] = useState({});
  const [detailBooking, setDetailBooking] = useState(null);
  const [notice, setNotice] = useState('');
  const [viewMode, setViewMode] = useState(searchParams.get('view') === 'calendar' ? 'calendar' : 'list');
  const [calendarWeekStart, setCalendarWeekStart] = useState(() => startOfWeekSunday(new Date()));
  const [calendarZoom, setCalendarZoom] = useState(67);
  const [openSavedFiltersMenu, setOpenSavedFiltersMenu] = useState(false);
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [savedFilterPreset, setSavedFilterPreset] = useState('default');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const rowMenuRef = useRef(null);
  const filterMenuRef = useRef(null);
  const savedFiltersRef = useRef(null);
  const pageSizeMenuRef = useRef(null);

  useEffect(() => {
    const nextMode = searchParams.get('view') === 'calendar' ? 'calendar' : 'list';
    if (nextMode !== viewMode) {
      setViewMode(nextMode);
    }
  }, [searchParams, viewMode]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BOOKING_META_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setBookingMeta(parsed);
        }
      }
    } catch {
      setBookingMeta({});
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(BOOKING_META_STORAGE_KEY, JSON.stringify(bookingMeta));
    } catch {
      // Ignore storage errors.
    }
  }, [bookingMeta]);

  useEffect(() => {
    if (!scopeParam) {
      navigate('/admin/bookings/upcoming', { replace: true });
      return;
    }

    if (!VALID_SCOPES.has(scopeParam)) {
      navigate('/admin/bookings/upcoming', { replace: true });
      return;
    }

    if (scopeParam !== activeScope) {
      setActiveScope(scopeParam);
    }
  }, [scopeParam, activeScope, navigate]);

  const loadScope = async (scope, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    setLoadingScope(scope);
    setError('');
    try {
      const data = await api.listBookings(scope);
      setBookingsByScope((current) => ({
        ...current,
        [scope]: Array.isArray(data) ? data : []
      }));
      setLoadedScopes((current) => ({
        ...current,
        [scope]: true
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      if (isInitial) {
        setLoading(false);
      }
      setLoadingScope('');
    }
  };

  useEffect(() => {
    if (!VALID_SCOPES.has(activeScope)) {
      return;
    }

    if (!loadedScopes[activeScope]) {
      loadScope(activeScope, true);
      return;
    }

    setLoading(false);
  }, [activeScope, loadedScopes]);

  useEffect(() => {
    if (!openMenuBookingId && !openFilterMenu && !openSavedFiltersMenu && !openPageSizeMenu) {
      return;
    }

    const handleCloseMenus = (event) => {
      if (
        rowMenuRef.current &&
        !rowMenuRef.current.contains(event.target)
      ) {
        setOpenMenuBookingId(null);
      }

      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setOpenFilterMenu(false);
      }

      if (
        savedFiltersRef.current &&
        !savedFiltersRef.current.contains(event.target)
      ) {
        setOpenSavedFiltersMenu(false);
      }

      if (
        pageSizeMenuRef.current &&
        !pageSizeMenuRef.current.contains(event.target)
      ) {
        setOpenPageSizeMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenMenuBookingId(null);
        setOpenFilterMenu(false);
        setOpenSavedFiltersMenu(false);
        setOpenPageSizeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleCloseMenus);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleCloseMenus);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openMenuBookingId, openFilterMenu, openSavedFiltersMenu, openPageSizeMenu]);

  const changeScope = (scope) => {
    if (!VALID_SCOPES.has(scope)) {
      return;
    }

    setOpenMenuBookingId(null);
    setOpenFilterMenu(false);
    setActiveFilters([]);
    setFilterDraftValue('');
    setSearchValue('');
    setCurrentPage(1);
    setActiveScope(scope);
    navigate(`/admin/bookings/${scope}`);
  };

  const changeViewMode = (mode) => {
    const nextMode = mode === 'calendar' ? 'calendar' : 'list';
    setViewMode(nextMode);

    const nextParams = new URLSearchParams(searchParams);
    if (nextMode === 'calendar') {
      nextParams.set('view', 'calendar');
    } else {
      nextParams.delete('view');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleCancel = async (id) => {
    try {
      await api.cancelBooking(id);
      await Promise.all([
        loadScope('upcoming'),
        loadScope('cancelled')
      ]);
      setLoadedScopes((current) => ({
        ...current,
        upcoming: true,
        cancelled: true
      }));
      setOpenMenuBookingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      const input = document.createElement('input');
      input.value = textToCopy;
      input.setAttribute('readonly', '');
      input.style.position = 'absolute';
      input.style.left = '-9999px';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }

    setNotice('Copied to clipboard');
  };

  const setMetaForBooking = (bookingId, updater) => {
    setBookingMeta((current) => {
      const previous = current[bookingId] || {};
      const nextValue = typeof updater === 'function' ? updater(previous) : updater;
      return {
        ...current,
        [bookingId]: {
          ...previous,
          ...nextValue
        }
      };
    });
  };

  const handleEditLocation = (booking) => {
    const currentLocation = bookingMeta[booking.id]?.location || 'Cal Video';
    const nextLocation = window.prompt('Enter location or meeting link:', currentLocation);
    if (nextLocation === null) {
      return;
    }

    setMetaForBooking(booking.id, { location: nextLocation.trim() || 'Cal Video' });
    setNotice('Location updated');
    setOpenMenuBookingId(null);
  };

  const handleAddGuests = (booking) => {
    const currentGuests = bookingMeta[booking.id]?.guests || [];
    const initialValue = currentGuests.join(', ');
    const raw = window.prompt('Add guest emails (comma separated):', initialValue);
    if (raw === null) {
      return;
    }

    const emails = raw
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    setMetaForBooking(booking.id, { guests: emails });
    setNotice('Guest list updated');
    setOpenMenuBookingId(null);
  };

  const handleMarkNoShow = (booking) => {
    const nextNoShow = !bookingMeta[booking.id]?.noShow;
    setMetaForBooking(booking.id, { noShow: nextNoShow });
    setNotice(nextNoShow ? 'Marked as no-show' : 'No-show removed');
    setOpenMenuBookingId(null);
  };

  const handleReportBooking = async (booking) => {
    const reportPayload = {
      bookingId: booking.id,
      bookerName: booking.booker_name,
      bookerEmail: booking.booker_email,
      eventType: booking.event_title,
      scope: activeScope,
      generatedAt: new Date().toISOString()
    };

    await handleCopy(JSON.stringify(reportPayload, null, 2));
    setOpenMenuBookingId(null);
  };

  const handleRequestReschedule = (booking) => {
    if (!booking.reschedule_token) {
      setNotice('Reschedule link is not available for this booking');
      setOpenMenuBookingId(null);
      return;
    }

    const rescheduleUrl = `${window.location.origin}/reschedule/${booking.reschedule_token}`;
    const subject = encodeURIComponent(`Reschedule request for booking #${booking.id}`);
    const body = encodeURIComponent(`Hi ${booking.booker_name},\n\nPlease use this link to pick a new slot:\n${rescheduleUrl}`);
    window.location.href = `mailto:${encodeURIComponent(booking.booker_email)}?subject=${subject}&body=${body}`;
    setNotice('Reschedule request draft opened');
    setOpenMenuBookingId(null);
  };

  const handleViewRecordings = (booking) => {
    const location = bookingMeta[booking.id]?.location || 'Cal Video';
    if (/^https?:\/\//i.test(location)) {
      window.open(location, '_blank', 'noreferrer');
      setNotice('Opening recording or meeting link');
    } else {
      setNotice('No recording link found. Use Edit location to add one.');
    }
    setOpenMenuBookingId(null);
  };

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const applyFilterDraft = () => {
    const trimmed = filterDraftValue.trim();
    if (!trimmed) {
      return;
    }

    setActiveFilters((current) => {
      const withoutExisting = current.filter((item) => item.field !== selectedFilterField);
      return [...withoutExisting, { field: selectedFilterField, value: trimmed }];
    });
    setFilterDraftValue('');
    setCurrentPage(1);
  };

  const removeFilter = (field) => {
    setActiveFilters((current) => current.filter((item) => item.field !== field));
    setCurrentPage(1);
  };

  const applySavedFilter = (preset) => {
    setSavedFilterPreset(preset);
    if (preset === 'default') {
      setActiveFilters([]);
    }
    if (preset === 'my-bookings') {
      setActiveFilters([{ field: 'Member', value: 'you' }]);
    }
    setCurrentPage(1);
    setOpenSavedFiltersMenu(false);
  };

  const rows = useMemo(() => bookingsByScope[activeScope] || [], [activeScope, bookingsByScope]);
  const searchedAndFilteredRows = useMemo(() => {
    const q = searchValue.trim().toLowerCase();

    return rows.filter((booking) => {
      const meta = bookingMeta[booking.id] || {};
      const haystack = [
        booking.event_title,
        booking.booker_name,
        booking.booker_email,
        String(booking.id),
        booking.event_slug,
        booking.user_name,
        meta.location
      ].join(' ').toLowerCase();

      if (q && !haystack.includes(q)) {
        return false;
      }

      return activeFilters.every((filter) => filterMatchesBooking(booking, filter, bookingMeta));
    });
  }, [rows, searchValue, activeFilters, bookingMeta]);

  const totalRows = searchedAndFilteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return searchedAndFilteredRows.slice(start, start + pageSize);
  }, [searchedAndFilteredRows, safeCurrentPage, pageSize]);

  const pagedGroupedRows = useMemo(() => {
    const groups = [];
    const groupMap = new Map();

    pagedRows.forEach((booking) => {
      const dayKey = toDayKey(booking.start_time_utc);
      if (!groupMap.has(dayKey)) {
        const next = { dayKey, items: [] };
        groupMap.set(dayKey, next);
        groups.push(next);
      }
      groupMap.get(dayKey).items.push(booking);
    });

    return groups;
  }, [pagedRows]);

  const pageStart = totalRows === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const pageEnd = totalRows === 0 ? 0 : Math.min(totalRows, safeCurrentPage * pageSize);
  const hourHeight = Math.round((calendarZoom / 100) * 56);
  const dayBodyHeight = hourHeight * 24;

  const calendarDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(calendarWeekStart, index)),
    [calendarWeekStart]
  );

  const weekRange = useMemo(() => {
    const start = new Date(calendarWeekStart);
    const end = addDays(calendarWeekStart, 7);
    return { start, end };
  }, [calendarWeekStart]);

  const calendarBookingsByDay = useMemo(() => {
    const grouped = Array.from({ length: 7 }, () => []);
    searchedAndFilteredRows.forEach((booking) => {
      const start = toUtcDate(booking.start_time_utc);
      const end = toUtcDate(booking.end_time_utc);
      if (!start || !end) {
        return;
      }

      if (start < weekRange.start || start >= weekRange.end) {
        return;
      }

      const dayIndex = start.getDay();
      grouped[dayIndex].push({ booking, start, end });
    });

    grouped.forEach((items) => items.sort((a, b) => a.start - b.start));
    return grouped;
  }, [searchedAndFilteredRows, weekRange]);

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
                onClick={() => changeScope(scope.key)}
              >
                {scope.label}
              </button>
            ))}
          </div>
          <div className="bookings-filter-wrap" ref={filterMenuRef}>
            <button
              type="button"
              className="bookings-filter-btn"
              onClick={() => setOpenFilterMenu((open) => !open)}
            >
              Filter
            </button>
            {openFilterMenu ? (
              <div className="bookings-filter-menu">
                <input
                  type="text"
                  placeholder="Search"
                  className="bookings-filter-search"
                  value={searchValue}
                  onChange={(event) => {
                    setSearchValue(event.target.value);
                    setCurrentPage(1);
                  }}
                />
                <div className="bookings-filter-options">
                  {FILTER_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`bookings-filter-option ${selectedFilterField === item ? 'bookings-filter-option-active' : ''}`}
                      onClick={() => setSelectedFilterField(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="bookings-filter-builder">
                  <input
                    type="text"
                    className="bookings-filter-search"
                    placeholder={selectedFilterField === 'Date Range' ? 'YYYY-MM-DD to YYYY-MM-DD' : `Value for ${selectedFilterField}`}
                    value={filterDraftValue}
                    onChange={(event) => setFilterDraftValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        applyFilterDraft();
                      }
                    }}
                  />
                  <button type="button" className="bookings-filter-apply" onClick={applyFilterDraft}>Apply</button>
                </div>
                {activeFilters.length > 0 ? (
                  <div className="bookings-active-filters">
                    {activeFilters.map((filter) => (
                      <button
                        key={filter.field}
                        type="button"
                        className="bookings-filter-chip"
                        onClick={() => removeFilter(filter.field)}
                      >
                        {filter.field}: {filter.value} x
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="bookings-right-tools">
          <div className="bookings-dropdown-wrap" ref={savedFiltersRef}>
            <button
              type="button"
              className={`bookings-filter-btn ${openSavedFiltersMenu ? 'bookings-dropdown-open' : ''}`}
              onClick={() => setOpenSavedFiltersMenu((open) => !open)}
            >
              Saved filters <span className={`bookings-caret ${openSavedFiltersMenu ? 'bookings-caret-open' : ''}`} aria-hidden="true" />
            </button>
            {openSavedFiltersMenu ? (
              <div className="bookings-dropdown-menu bookings-saved-filter-menu">
                <button
                  type="button"
                  className={`bookings-dropdown-item ${savedFilterPreset === 'default' ? 'bookings-dropdown-item-active' : ''}`}
                  onClick={() => applySavedFilter('default')}
                >
                  <span>Default</span>
                </button>
                <button
                  type="button"
                  className={`bookings-dropdown-item ${savedFilterPreset === 'my-bookings' ? 'bookings-dropdown-item-active' : ''}`}
                  onClick={() => applySavedFilter('my-bookings')}
                >
                  <span>My bookings</span>
                  <span className="bookings-dropdown-ellipsis">...</span>
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className={`bookings-icon-btn ${viewMode === 'list' ? 'bookings-icon-btn-active' : ''}`}
            aria-label="List view"
            onClick={() => changeViewMode('list')}
          >=</button>
          <button
            type="button"
            className={`bookings-icon-btn ${viewMode === 'calendar' ? 'bookings-icon-btn-active' : ''}`}
            aria-label="Calendar view"
            onClick={() => changeViewMode('calendar')}
          >[]</button>
        </div>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}
      {notice ? <div className="success-banner">{notice}</div> : null}

      <section className="bookings-board">
        {viewMode === 'calendar' ? (
          <section className="bookings-calendar-view">
            <div className="bookings-calendar-controls">
              <button type="button" className="bookings-calendar-range-btn">{formatRangeLabel(calendarWeekStart)} []</button>

              <div className="bookings-calendar-zoom-wrap">
                <span>{calendarZoom}%</span>
                <button
                  type="button"
                  className="bookings-calendar-zoom-btn"
                  onClick={() => setCalendarZoom((value) => Math.max(45, value - 5))}
                >
                  -
                </button>
                <button
                  type="button"
                  className="bookings-calendar-zoom-btn"
                  onClick={() => setCalendarZoom((value) => Math.min(120, value + 5))}
                >
                  +
                </button>
                <button type="button" className="bookings-calendar-reset-btn" onClick={() => setCalendarZoom(67)}>Reset</button>
              </div>

              <div className="bookings-calendar-nav">
                <button type="button" className="bookings-calendar-today-btn" onClick={() => setCalendarWeekStart(startOfWeekSunday(new Date()))}>Today</button>
                <button type="button" className="bookings-calendar-arrow-btn" onClick={() => setCalendarWeekStart((value) => addDays(value, -7))}>&lt;</button>
                <button type="button" className="bookings-calendar-arrow-btn" onClick={() => setCalendarWeekStart((value) => addDays(value, 7))}>&gt;</button>
              </div>
            </div>

            {loading || loadingScope === activeScope ? <p className="muted">Loading bookings...</p> : null}

            <div className="bookings-calendar-grid">
              <div className="bookings-calendar-header-cell bookings-calendar-timezone">{timezoneLabel()}</div>
              {calendarDays.map((date) => {
                const { weekday, day } = formatDayHeading(date);
                return (
                  <div key={date.toISOString()} className="bookings-calendar-header-cell">
                    <span>{weekday}</span>
                    <strong>{day}</strong>
                  </div>
                );
              })}

              <div className="bookings-calendar-time-column" style={{ height: `${dayBodyHeight}px` }}>
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="bookings-calendar-hour-label" style={{ top: `${hour * hourHeight}px` }}>
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {calendarDays.map((date, dayIndex) => (
                <div key={`${date.toISOString()}-body`} className="bookings-calendar-day-column" style={{ height: `${dayBodyHeight}px`, ['--hour-height']: `${hourHeight}px` }}>
                  {calendarBookingsByDay[dayIndex].map(({ booking, start, end }) => {
                    const startMinutes = start.getHours() * 60 + start.getMinutes();
                    const endMinutes = end.getHours() * 60 + end.getMinutes();
                    const top = (startMinutes / 60) * hourHeight;
                    const height = Math.max(22, ((endMinutes - startMinutes) / 60) * hourHeight);

                    return (
                      <button
                        key={booking.id}
                        type="button"
                        className="bookings-calendar-event"
                        style={{ top: `${top}px`, height: `${height}px` }}
                        onClick={() => setDetailBooking(booking)}
                        title={`${booking.event_title} with ${booking.booker_name}`}
                      >
                        <span>{durationMinutes(booking.start_time_utc, booking.end_time_utc)} min meeting between {booking.booker_name}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        ) : (
          <>
            {loading || loadingScope === activeScope ? <p className="muted">Loading bookings...</p> : null}
            {!loading && searchedAndFilteredRows.length === 0 ? (
              <EmptyState scope={activeScope} />
            ) : null}

            {pagedGroupedRows.map((group) => (
              <div key={group.dayKey}>
                <p className="bookings-group-title">{formatDayHeader(group.dayKey)}</p>
                {group.items.map((booking, index) => (
                  <article key={booking.id} className={`bookings-row-card ${index % 2 === 0 ? 'bookings-row-card-dark' : ''}`}>
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
                      {bookingMeta[booking.id]?.noShow ? <p className="bookings-no-show-badge">Marked as no-show</p> : null}
                      {bookingMeta[booking.id]?.guests?.length ? (
                        <p className="bookings-guests">Guests: {bookingMeta[booking.id].guests.join(', ')}</p>
                      ) : null}
                      <p className="muted bookings-row-meta">{humanDateTime(booking.start_time_utc)}</p>
                    </div>

                    <div className="bookings-row-actions" ref={openMenuBookingId === booking.id ? rowMenuRef : null}>
                      <div className="bookings-more-wrap">
                        <button
                          type="button"
                          className="bookings-more-btn"
                          aria-label="Booking actions"
                          onClick={() => setOpenMenuBookingId((current) => (current === booking.id ? null : booking.id))}
                        >
                          ...
                        </button>

                        {openMenuBookingId === booking.id ? (
                          <div className="bookings-row-menu">
                            <button
                              type="button"
                              onClick={() => {
                                navigate('/admin/event-types');
                                setOpenMenuBookingId(null);
                              }}
                            >
                              Edit event
                            </button>
                            {booking.reschedule_token ? (
                              <a
                                href={`/reschedule/${booking.reschedule_token}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setOpenMenuBookingId(null)}
                              >
                                Reschedule booking
                              </a>
                            ) : (
                              <button type="button" disabled>Reschedule booking</button>
                            )}
                            <button type="button" onClick={() => handleRequestReschedule(booking)}>Request reschedule</button>
                            <button type="button" onClick={() => handleEditLocation(booking)}>Edit location</button>
                            <button
                              type="button"
                              onClick={() => handleAddGuests(booking)}
                            >
                              Add guests
                            </button>

                            <div className="bookings-row-menu-divider" />

                            <button type="button" onClick={() => handleViewRecordings(booking)}>View recordings</button>
                            <button
                              type="button"
                              onClick={() => {
                                setDetailBooking(booking);
                                setOpenMenuBookingId(null);
                              }}
                            >
                              View session details
                            </button>
                            <button type="button" onClick={() => handleMarkNoShow(booking)}>
                              {bookingMeta[booking.id]?.noShow ? 'Unmark no-show' : 'Mark as no-show'}
                            </button>

                            <div className="bookings-row-menu-divider" />

                            <button
                              type="button"
                              onClick={() => handleReportBooking(booking)}
                            >
                              Report booking
                            </button>
                            <button
                              type="button"
                              className="bookings-row-menu-danger"
                              onClick={() => handleCancel(booking.id)}
                              disabled={activeScope === 'cancelled' || activeScope === 'past'}
                            >
                              Cancel event
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ))}

            <footer className="bookings-board-footer">
              <div className="bookings-page-size">
                <div className="bookings-dropdown-wrap" ref={pageSizeMenuRef}>
                  <button
                    type="button"
                    className={`bookings-page-size-btn ${openPageSizeMenu ? 'bookings-dropdown-open' : ''}`}
                    onClick={() => setOpenPageSizeMenu((open) => !open)}
                  >
                    {pageSize} <span className={`bookings-caret ${openPageSizeMenu ? 'bookings-caret-open' : ''}`} aria-hidden="true" />
                  </button>
                  {openPageSizeMenu ? (
                    <div className="bookings-dropdown-menu bookings-page-size-menu">
                      {[10, 25, 50, 100].map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={`bookings-dropdown-item ${pageSize === size ? 'bookings-dropdown-item-active' : ''}`}
                          onClick={() => {
                            setPageSize(size);
                            setCurrentPage(1);
                            setOpenPageSizeMenu(false);
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <span>rows per page</span>
              </div>
              <div className="bookings-pagination">
                <span>{`${pageStart}-${pageEnd} of ${totalRows}`}</span>
                <button
                  type="button"
                  className="bookings-page-nav"
                  aria-label="Previous page"
                  onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                  disabled={safeCurrentPage <= 1}
                >&lt;</button>
                <button
                  type="button"
                  className="bookings-page-nav"
                  aria-label="Next page"
                  onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                  disabled={safeCurrentPage >= totalPages}
                >&gt;</button>
              </div>
            </footer>
          </>
        )}
      </section>

      {detailBooking ? (
        <div className="bookings-details-modal-backdrop" onClick={() => setDetailBooking(null)}>
          <div className="bookings-details-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Session details</h3>
            <p><strong>Booking UID:</strong> {detailBooking.id}</p>
            <p><strong>Event type:</strong> {detailBooking.event_title}</p>
            <p><strong>Attendee:</strong> {detailBooking.booker_name} ({detailBooking.booker_email})</p>
            <p><strong>When:</strong> {humanDateTime(detailBooking.start_time_utc)}</p>
            <p><strong>Location:</strong> {bookingMeta[detailBooking.id]?.location || 'Cal Video'}</p>
            <p><strong>Guests:</strong> {(bookingMeta[detailBooking.id]?.guests || []).join(', ') || 'None'}</p>
            <p><strong>Status:</strong> {bookingMeta[detailBooking.id]?.noShow ? 'No-show' : 'Confirmed'}</p>
            <button type="button" className="bookings-filter-btn" onClick={() => setDetailBooking(null)}>Close</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
