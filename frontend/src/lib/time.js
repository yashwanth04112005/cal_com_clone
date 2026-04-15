export function formatMinutes(minutes) {
  return `${minutes}m`;
}

export function slugPath(slug) {
  return `/book/${slug}`;
}

export function humanDateTime(value) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function isoDateToday() {
  return new Date().toISOString().slice(0, 10);
}
