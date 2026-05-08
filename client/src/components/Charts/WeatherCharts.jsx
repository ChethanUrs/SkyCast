import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-glass-strong)', border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px', backdropFilter: 'blur(20px)',
    }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600, fontSize: '0.9rem' }}>
          {p.name}: {p.value}{p.unit || ''}
        </p>
      ))}
    </div>
  );
};

export const TemperatureTrendChart = ({ daily }) => {
  if (!daily?.length) return null;
  const data = daily.map(d => ({
    day: new Date(d.date + 'T12:00').toLocaleDateString('en', { weekday: 'short' }),
    Max: d.tempMax, Min: d.tempMin, Avg: d.avgTemp,
  }));

  return (
    <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 'var(--space-6)' }} id="temp-trend-chart">
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 20 }}>📈 Temperature Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="Max" stroke="#f59e0b" strokeWidth={2.5} fill="url(#tempGrad)" name="Max" dot={{ fill: '#f59e0b', r: 4 }} />
          <Line type="monotone" dataKey="Min" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 4 }} name="Min" />
          <Line type="monotone" dataKey="Avg" stroke="#34d399" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Avg" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export const PrecipitationChart = ({ hourly }) => {
  if (!hourly?.length) return null;
  const data = hourly.map(h => ({
    time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit' }),
    Precipitation: h.pop,
  }));

  return (
    <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 'var(--space-6)' }} id="precip-chart">
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 20 }}>🌧️ Precipitation Probability</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Precipitation" fill="url(#precipGrad)" radius={[4, 4, 0, 0]} name="Chance" unit="%" />
          <defs>
            <linearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export const HumidityWindChart = ({ hourly }) => {
  if (!hourly?.length) return null;
  const data = hourly.map(h => ({
    time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit' }),
    Humidity: h.humidity,
    Wind: h.windSpeed,
  }));

  return (
    <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 'var(--space-6)' }} id="humidity-wind-chart">
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 20 }}>💧 Humidity & 🌬️ Wind</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="Humidity" stroke="#818cf8" strokeWidth={2} dot={false} unit="%" name="Humidity" />
          <Line type="monotone" dataKey="Wind" stroke="#f59e0b" strokeWidth={2} dot={false} name="Wind" />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
