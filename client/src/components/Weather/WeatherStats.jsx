import React from 'react';
import { motion } from 'framer-motion';

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const StatCard = ({ icon, label, value, sub, index }) => (
  <motion.div
    className="glass-card"
    custom={index}
    variants={statVariants}
    initial="hidden"
    animate="show"
    style={{ padding: 'var(--space-4)', textAlign: 'center' }}
  >
    <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{icon}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
    {sub && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>{sub}</div>}
  </motion.div>
);

const WeatherStats = ({ data }) => {
  if (!data) return null;
  const windUnitLabels = {
    kmh: 'km/h',
    mph: 'mph',
    kn: 'knots',
    ms: 'm/s'
  };
  const windLabel = data.windUnit ? (windUnitLabels[data.windUnit] || data.windUnit) : 'km/h';

  const stats = [
    { icon: '💧', label: 'Humidity', value: `${data.humidity}%` },
    { icon: '🌬️', label: 'Wind Speed', value: `${data.windSpeed}`, sub: windLabel },
    { icon: '🧭', label: 'Wind Dir', value: data.windDirection || `${data.windDeg}°` },
    { icon: '📊', label: 'Pressure', value: `${data.pressure} hPa` },
    { icon: '👁️', label: 'Visibility', value: data.visibility ? `${data.visibility} km` : 'N/A' },
    { icon: '☁️', label: 'Cloudiness', value: `${data.cloudiness}%` },
    ...(data.windGust ? [{ icon: '💨', label: 'Wind Gust', value: `${data.windGust}` }] : []),
  ];

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
        🌡️ Conditions
      </h3>
      <div className="stats-grid">
        {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
      </div>
    </div>
  );
};

export default WeatherStats;
