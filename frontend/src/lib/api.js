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
  createSchedule(payload) {
    return request('/api/availability/schedules', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateSchedule(id, payload) {
    return request(`/api/availability/schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },
  deleteSchedule(id) {
    return request(`/api/availability/schedules/${id}`, {
      method: 'DELETE'
    });
  },
  replaceScheduleWindows(id, payload) {
    return request(`/api/availability/schedules/${id}/windows`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
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
  listPublicProfileEventTypes(username) {
    return request(`/api/public/profiles/${encodeURIComponent(username)}/event-types`);
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
  },
  getSettingsProfile() {
    return request('/api/settings/profile');
  },
  updateSettingsProfile(payload) {
    return request('/api/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },
  getSettingsGeneral() {
    return request('/api/settings/general');
  },
  updateSettingsGeneral(payload) {
    return request('/api/settings/general', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },
  getSettingsSecurity() {
    return request('/api/settings/security');
  },
  updateSettingsSecurity(payload) {
    return request('/api/settings/security', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },
  searchSettings(query) {
    return request(`/api/settings/search?q=${encodeURIComponent(query)}`);
  },
  listTeams() {
    return request('/api/settings/teams');
  },
  createTeam(payload) {
    return request('/api/settings/teams', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  listWebhooks() {
    return request('/api/settings/webhooks');
  },
  createWebhook(payload) {
    return request('/api/settings/webhooks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  deleteWebhook(id) {
    return request(`/api/settings/webhooks/${id}`, {
      method: 'DELETE'
    });
  },
  listApiKeys() {
    return request('/api/settings/api-keys');
  },
  createApiKey(payload) {
    return request('/api/settings/api-keys', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  deleteApiKey(id) {
    return request(`/api/settings/api-keys/${id}`, {
      method: 'DELETE'
    });
  },
  listOAuthClients() {
    return request('/api/settings/oauth-clients');
  },
  createOAuthClient(payload) {
    return request('/api/settings/oauth-clients', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  deleteOAuthClient(id) {
    return request(`/api/settings/oauth-clients/${id}`, {
      method: 'DELETE'
    });
  },
  listAppStore() {
    return request('/api/apps/store');
  },
  listInstalledApps() {
    return request('/api/apps/installed');
  },
  installApp(appId) {
    return request('/api/apps/installed', {
      method: 'POST',
      body: JSON.stringify({ app_id: appId })
    });
  },
  uninstallApp(appId) {
    return request(`/api/apps/installed/${appId}`, {
      method: 'DELETE'
    });
  },
  listWorkflows() {
    return request('/api/workflows');
  },
  createWorkflow(payload) {
    return request('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getWorkflow(id) {
    return request(`/api/workflows/${id}`);
  },
  updateWorkflow(id, payload) {
    return request(`/api/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },
  listCallHistory() {
    return request('/api/insights/call-history');
  },
  getReferralStats() {
    return request('/api/refer/stats');
  }
};
