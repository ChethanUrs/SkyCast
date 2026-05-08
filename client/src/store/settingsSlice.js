import { createSlice } from '@reduxjs/toolkit';

const getInitial = (key, fallback) => {
  try { const v = localStorage.getItem(`skycast-${key}`); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    temperatureUnit: getInitial('tempUnit', 'celsius'),
    windUnit: getInitial('windUnit', 'kmh'),
    timeFormat: getInitial('timeFormat', '12h'),
    language: getInitial('language', 'en'),
    notificationsEnabled: getInitial('notifications', true),
  },
  reducers: {
    setTemperatureUnit: (state, { payload }) => {
      state.temperatureUnit = payload;
      localStorage.setItem('skycast-tempUnit', JSON.stringify(payload));
    },
    setWindUnit: (state, { payload }) => {
      state.windUnit = payload;
      localStorage.setItem('skycast-windUnit', JSON.stringify(payload));
    },
    setTimeFormat: (state, { payload }) => {
      state.timeFormat = payload;
      localStorage.setItem('skycast-timeFormat', JSON.stringify(payload));
    },
    setLanguage: (state, { payload }) => {
      state.language = payload;
      localStorage.setItem('skycast-language', JSON.stringify(payload));
    },
    setNotifications: (state, { payload }) => {
      state.notificationsEnabled = payload;
      localStorage.setItem('skycast-notifications', JSON.stringify(payload));
    },
    hydrateFromServer: (state, { payload }) => {
      return { ...state, ...payload };
    },
  },
});

export const {
  setTemperatureUnit, setWindUnit, setTimeFormat,
  setLanguage, setNotifications, hydrateFromServer,
} = settingsSlice.actions;

export default settingsSlice.reducer;
