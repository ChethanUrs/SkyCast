import React from 'react';
import { motion } from 'framer-motion';

const HourlyForecast = ({ data }) => {
  if (!data?.length) return null;

  const formatTime = (dtTxt) => {
    const d = new Date(dtTxt);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
        ⏱️ Next 24 Hours
      </h3>
      <div className="hourly-scroll" id="hourly-forecast">
        {data.map((item, i) => (
          <motion.div
            key={item.unixTime}
            className="glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              minWidth: 88, padding: 'var(--space-4) var(--space-3)',
              textAlign: 'center', flexShrink: 0,
            }}
          >
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 6 }}>{formatTime(item.time)}</div>
            <img src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`} alt={item.description} style={{ width: 42, height: 42 }} />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', margin: '4px 0' }}>
              {item.temperature}°
            </div>
            <div style={{ color: 'var(--accent-primary)', fontSize: '0.75rem' }}>💧{item.pop}%</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecast;
