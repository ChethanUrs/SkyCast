import React from 'react';
import { motion } from 'framer-motion';

const AQI_CONFIG = [
  null,
  { label: 'Good', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '😊', desc: 'Air quality is satisfactory.' },
  { label: 'Fair', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '🙂', desc: 'Air quality is acceptable.' },
  { label: 'Moderate', color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: '😐', desc: 'Sensitive groups may be affected.' },
  { label: 'Poor', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '😷', desc: 'Everyone may begin to feel effects.' },
  { label: 'Very Poor', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', icon: '🚫', desc: 'Health alert — serious effects.' },
];

const AQICard = ({ data }) => {
  if (!data) return null;
  const config = AQI_CONFIG[data.aqi];
  const pct = ((data.aqi - 1) / 4) * 100;

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: 'var(--space-6)' }}
      id="aqi-card"
    >
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
        🌿 Air Quality Index
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: config.bg, border: `2px solid ${config.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', flexShrink: 0,
        }}>
          {config.icon}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: config.color }}>
            AQI {data.aqi} — {config.label}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>{config.desc}</div>
        </div>
      </div>

      {/* Progress gauge */}
      <div style={{ background: 'linear-gradient(90deg, #10b981, #f59e0b, #f97316, #ef4444, #7c3aed)', height: 8, borderRadius: '9999px', position: 'relative', marginBottom: 8 }}>
        <motion.div
          initial={{ left: '0%' }}
          animate={{ left: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
            width: 16, height: 16, borderRadius: '50%', background: '#fff',
            boxShadow: `0 0 8px ${config.color}`,
          }}
        />
      </div>

      {/* Pollutant breakdown */}
      {data.components && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
          {Object.entries({ 'PM2.5': data.components.pm2_5, 'PM10': data.components.pm10, 'NO₂': data.components.no2, 'O₃': data.components.o3 }).map(([k, v]) => (
            <span key={k} style={{
              background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)', padding: '3px 10px',
              fontSize: '0.78rem', color: 'var(--text-secondary)',
            }}>
              {k}: {v?.toFixed(1)} μg/m³
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AQICard;
