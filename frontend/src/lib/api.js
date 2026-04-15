const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  listEventTypes() {
    return request('/api/event-types');
  },
  createEventType(payload) {
    return request('/api/event-types', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateEventType(id, payload) {
    return request(`/api/event-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },
  deleteEventType(id) {
    return request(`/api/event-types/${id}`, {
      method: 'DELETE'
    });
  },
  listSchedules() {
    return request('/api/availability/schedules');
  },
  listBookings(scope = 'upcoming') {
    return request(`/api/bookings?scope=${scope}`);
  },
  cancelBooking(id) {
    return request(`/api/bookings/${id}/cancel`, {
      method: 'PATCH'
    });
  },
  getPublicEvent(slug) {
    return request(`/api/public/event-types/${slug}`);
  },
  getPublicSlots(slug, date) {
    return request(`/api/public/event-types/${slug}/slots?date=${date}`);
  },
  createPublicBooking(slug, payload) {
    return request(`/api/public/event-types/${slug}/bookings`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getRescheduleBooking(token) {
    return request(`/api/public/bookings/reschedule/${token}`);
  },
  rescheduleBooking(token, payload) {
    return request(`/api/public/bookings/reschedule/${token}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
