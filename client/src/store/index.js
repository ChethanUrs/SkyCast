import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    settings: settingsReducer,
  },
});
