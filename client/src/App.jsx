import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { store } from './store';
import SplashScreen from './components/SplashScreen/SplashScreen';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import AuthModal from './components/Auth/AuthModal';
import SettingsPanel from './components/Settings/SettingsPanel';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } },
});

// Shared search state lifted to App level
const AppContent = () => {
  const [splashDone, setSplashDone] = useState(false);
  const [searchParams, setSearchParams] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);

  const handleSearch = useCallback((params) => setSearchParams({ ...params, _ts: Date.now() }), []);

  if (!splashDone) {
    return <SplashScreen onComplete={() => setSplashDone(true)} />;
  }

  return (
    <BrowserRouter>
      <Navbar onSearch={handleSearch} />
      <Sidebar
        savedLocations={savedLocations}
        onLocationSelect={(loc) => handleSearch({ lat: loc.lat, lon: loc.lon, cityName: loc.cityName })}
        onLocationRemove={(id) => setSavedLocations((prev) => prev.filter((l) => l._id !== id))}
      />
      <AuthModal />
      <SettingsPanel />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                searchParams={searchParams}
                savedLocations={savedLocations}
                onLocationsChange={setSavedLocations}
              />
            }
          />
          <Route
            path="/auth/callback"
            element={
              <HomePage
                searchParams={searchParams}
                savedLocations={savedLocations}
                onLocationsChange={setSavedLocations}
              />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-glass-strong)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            fontFamily: 'var(--font-sans)',
          },
          duration: 3500,
        }}
      />
    </BrowserRouter>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
