import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    authModalOpen: false,
    authModalMode: 'login', // 'login' | 'register'
    sidebarOpen: false,
    settingsPanelOpen: false,
    activeTab: 'today', // 'today' | 'hourly' | '7day' | 'charts'
    searchExpanded: false,
    compareMode: false,
  },
  reducers: {
    openAuthModal: (state, action) => {
      state.authModalOpen = true;
      state.authModalMode = action.payload || 'login';
    },
    closeAuthModal: (state) => { state.authModalOpen = false; },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    closeSidebar: (state) => { state.sidebarOpen = false; },
    toggleSettings: (state) => { state.settingsPanelOpen = !state.settingsPanelOpen; },
    setActiveTab: (state, action) => { state.activeTab = action.payload; },
    setSearchExpanded: (state, action) => { state.searchExpanded = action.payload; },
    toggleCompareMode: (state) => { state.compareMode = !state.compareMode; },
  },
});

export const {
  openAuthModal, closeAuthModal, toggleSidebar, closeSidebar,
  toggleSettings, setActiveTab, setSearchExpanded, toggleCompareMode,
} = uiSlice.actions;

export default uiSlice.reducer;
