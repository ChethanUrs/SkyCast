import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DayCard = ({ day, index }) => {
  const [expanded, setExpanded] = useState(false);
  const d = new Date(day.date + 'T12:00:00');
  const dayName = index === 0 ? 'Today' : d.toLocaleDateString('en', { weekday: 'long' });
  const dateStr = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{ overflow: 'hidden' }}
    >
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-5)', cursor: 'pointer',
        }}
        id={`day-forecast-${index}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <img src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} alt={day.description} style={{ width: 44, height: 44 }} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dayName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dateStr}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>💧 {day.pop}%</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{day.tempMin}°</span>
          <div style={{
            width: 60, height: 6, borderRadius: '9999px',
            background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-warm))',
            opacity: 0.7,
          }} />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{day.tempMax}°</span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ color: 'var(--text-muted)' }}>▼</motion.span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: 'var(--space-3) var(--space-5) var(--space-4)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex', flexWrap: 'wrap', gap: 20,
              color: 'var(--text-secondary)', fontSize: '0.875rem',
            }}>
              <span>💧 Humidity: {day.humidity}%</span>
              <span>🌬️ Wind: {day.windSpeed} km/h</span>
              <span style={{ textTransform: 'capitalize' }}>🌤️ {day.description}</span>
              <span>🌡️ Avg: {day.avgTemp}°</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DailyForecast = ({ data }) => {
  if (!data?.length) return null;
  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
        📅 7-Day Forecast
      </h3>
      <div className="forecast-grid">
        {data.map((day, i) => <DayCard key={day.date} day={day} index={i} />)}
      </div>
    </div>
  );
};

export default DailyForecast;
