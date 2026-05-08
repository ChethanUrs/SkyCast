import api from './api';

// ── Weather ───────────────────────────────────────────────────────────────────
export const weatherService = {
  /**
   * Get full weather data (current + forecast + AQI + AI summary)
   * @param {object} params  { city } OR { lat, lon }  + optional { unit }
   */
  getWeather: (params) => api.get('/weather', { params }),

  /**
   * City autocomplete search
   * @param {string} query
   */
  searchCities: (query) => api.get('/weather/search', { params: { q: query } }),
};

// ── Saved Locations ───────────────────────────────────────────────────────────
export const locationService = {
  getAll: () => api.get('/locations'),
  add: (payload) => api.post('/locations', payload),
  remove: (id) => api.delete(`/locations/${id}`),
  reorder: (ids) => api.patch('/locations/reorder', { ids }),
};

// ── User Preferences ──────────────────────────────────────────────────────────
export const preferenceService = {
  get: () => api.get('/preferences'),
  update: (prefs) => api.patch('/preferences', prefs),
};
