import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { openAuthModal } from '../store/uiSlice';
import { useAuth } from '../context/AuthContext';
import { weatherService, locationService } from '../services/weatherApi';
import CurrentWeather from '../components/Weather/CurrentWeather';
import WeatherStats from '../components/Weather/WeatherStats';
import HourlyForecast from '../components/Weather/HourlyForecast';
import DailyForecast from '../components/Weather/DailyForecast';
import AQICard from '../components/Weather/AQICard';
import { TemperatureTrendChart, PrecipitationChart, HumidityWindChart } from '../components/Charts/WeatherCharts';
import OutfitRecommender from '../components/Extras/OutfitRecommender';
import AISummaryCard from '../components/Extras/AISummaryCard';
import toast from 'react-hot-toast';

const SkeletonCard = ({ height = 200 }) => (
  <div className="skeleton" style={{ height, borderRadius: 'var(--radius-xl)' }} />
);

const EmptyState = ({ onGeolocate, loading }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    style={{ textAlign: 'center', padding: 'var(--space-20) var(--space-4)' }}>
    <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{ fontSize: '5rem', marginBottom: 20 }}>🌤️</motion.div>
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: 12, color: 'var(--text-primary)' }}>
      Welcome to SkyCast
    </h2>
    <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
      Search any city in the search bar above, or let us auto-detect your location.
    </p>
    <motion.button className="btn-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
      onClick={onGeolocate} disabled={loading} id="detect-location-btn"
      style={{ fontSize: '1rem', padding: '14px 32px' }}>
      {loading ? '📍 Detecting...' : '📍 Detect My Location'}
    </motion.button>
  </motion.div>
);

const HomePage = ({ searchParams, savedLocations, onLocationsChange }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { temperatureUnit, windUnit, timeFormat } = useSelector((s) => s.settings);

  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [aiRecs, setAiRecs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);

  const fetchWeather = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const reqParams = {
        ...(params.lat != null ? { lat: params.lat, lon: params.lon } : { city: params.city }),
        unit: temperatureUnit,
        windUnit,
        timeFormat,
      };

      const { data: res } = await weatherService.getWeather(reqParams);

      if (res.success) {
        setCurrent(res.data.current);
        setForecast(res.data.forecast);
        setAiRecs(res.data.aiRecommendations);
        setCurrentCoords({ lat: res.data.current.lat, lon: res.data.current.lon });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not fetch weather. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [temperatureUnit, windUnit, timeFormat]);

  // React to search from Navbar/Sidebar
  useEffect(() => {
    if (searchParams) fetchWeather(searchParams);
  }, [searchParams]);

  // Re-fetch on unit/format change
  useEffect(() => {
    if (currentCoords) fetchWeather(currentCoords);
  }, [temperatureUnit, windUnit, timeFormat]);

  // Load saved locations when user logs in
  useEffect(() => {
    if (user) {
      locationService.getAll()
        .then(r => onLocationsChange?.(r.data.data || []))
        .catch(() => {});
    } else {
      onLocationsChange?.([]);
    }
  }, [user]);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGeoLoading(false);
        fetchWeather({ lat: coords.latitude, lon: coords.longitude });
      },
      (err) => {
        setGeoLoading(false);
        let msg = 'Location access denied.';
        if (err.code === 2) msg = 'Location unavailable.';
        if (err.code === 3) msg = 'Location request timed out.';
        toast.error(msg);
      },
      { timeout: 10000 }
    );
  }, [fetchWeather]);

  // Auto-detect location on mount if no search is active
  useEffect(() => {
    if (!searchParams && !current && !loading && !geoLoading) {
      handleGeolocate();
    }
  }, []); // Only on initial mount

  const isSaved = savedLocations?.some(
    (l) => currentCoords && Math.abs(l.lat - currentCoords.lat) < 0.05 && Math.abs(l.lon - currentCoords.lon) < 0.05
  );

  const handleSaveLocation = async () => {
    if (!user) { 
      toast('Sign in to save locations', { icon: '🔑' });
      dispatch(openAuthModal('login'));
      return; 
    }
    try {
      const res = await locationService.add({
        cityName: current.cityName, country: current.country,
        lat: current.lat, lon: current.lon,
      });
      onLocationsChange?.(res.data.data);
      toast.success(`${current.cityName} saved! ⭐`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <div className="page-container">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <SkeletonCard height={270} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} height={100} />)}
            </div>
            <SkeletonCard height={80} />
            <SkeletonCard height={120} />
            <SkeletonCard height={260} />
          </motion.div>
        ) : current ? (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            {/* Save button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <motion.button
                className={isSaved ? 'btn-ghost' : 'btn-primary'}
                whileTap={{ scale: 0.95 }} onClick={handleSaveLocation} disabled={isSaved}
                id="save-location-btn" style={{ fontSize: '0.875rem' }}
              >
                {isSaved ? '✅ Saved' : '⭐ Save Location'}
              </motion.button>
            </div>

            <CurrentWeather data={current} />

            {/* AI Summary Card */}
            {current.aiSummary && <AISummaryCard summary={current.aiSummary} />}

            <WeatherStats data={current} />
            {forecast?.hourly && <HourlyForecast data={forecast.hourly} />}
            {forecast?.daily && <DailyForecast data={forecast.daily} />}
            {current.aqi && <AQICard data={current.aqi} />}
            {forecast?.daily && <TemperatureTrendChart daily={forecast.daily} />}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
              {forecast?.hourly && <PrecipitationChart hourly={forecast.hourly} />}
              {forecast?.hourly && <HumidityWindChart hourly={forecast.hourly} />}
            </div>
            <OutfitRecommender weather={current} aiRecs={aiRecs} />
          </motion.div>
        ) : (
          <EmptyState key="empty" onGeolocate={handleGeolocate} loading={geoLoading} />
        )}
      </AnimatePresence>

      {error && !loading && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 24, padding: 20, borderRadius: 'var(--radius-xl)',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--accent-danger)', textAlign: 'center',
          }} id="error-banner">
          ⚠️ {error}
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;
