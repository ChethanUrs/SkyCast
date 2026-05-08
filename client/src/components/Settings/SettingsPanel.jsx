import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSettings, setActiveTab } from '../../store/uiSlice';
import { setTemperatureUnit, setWindUnit, setTimeFormat } from '../../store/settingsSlice';

const ToggleGroup = ({ label, value, options, onChange }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{label}</div>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '7px 16px', borderRadius: 'var(--radius-full)',
            border: '1px solid',
            borderColor: value === opt.value ? 'var(--accent-primary)' : 'var(--border-subtle)',
            background: value === opt.value ? 'var(--gradient-accent)' : 'var(--bg-glass)',
            color: value === opt.value ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 500,
            transition: 'all 0.2s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const SettingsPanel = () => {
  const dispatch = useDispatch();
  const { settingsPanelOpen } = useSelector((s) => s.ui);
  const { temperatureUnit, windUnit, timeFormat } = useSelector((s) => s.settings);

  return (
    <>
      <AnimatePresence>
        {settingsPanelOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 'var(--z-overlay)', backdropFilter: 'blur(4px)' }}
            onClick={() => dispatch(toggleSettings())}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {settingsPanelOpen && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            id="settings-panel"
            style={{
              position: 'fixed', right: 0, top: 0, bottom: 0, width: 320,
              background: 'var(--bg-glass-strong)', backdropFilter: 'blur(30px)',
              borderLeft: '1px solid var(--border-glass)',
              zIndex: 'calc(var(--z-overlay) + 1)', padding: 'var(--space-6)',
              overflowY: 'auto', boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-primary)' }}>⚙️ Settings</h2>
              <button onClick={() => dispatch(toggleSettings())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.3rem' }}>✕</button>
            </div>

            <ToggleGroup
              label="Temperature Unit"
              value={temperatureUnit}
              options={[{ value: 'celsius', label: '°C' }, { value: 'fahrenheit', label: '°F' }, { value: 'kelvin', label: 'K' }]}
              onChange={(v) => dispatch(setTemperatureUnit(v))}
            />
            <ToggleGroup
              label="Wind Speed"
              value={windUnit}
              options={[{ value: 'kmh', label: 'km/h' }, { value: 'mph', label: 'mph' }, { value: 'knots', label: 'knots' }, { value: 'ms', label: 'm/s' }]}
              onChange={(v) => dispatch(setWindUnit(v))}
            />
            <ToggleGroup
              label="Time Format"
              value={timeFormat}
              options={[{ value: '12h', label: '12-hour' }, { value: '24h', label: '24-hour' }]}
              onChange={(v) => dispatch(setTimeFormat(v))}
            />

            <div style={{ marginTop: 32, padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                🌤️ SkyCast v1.0.0<br />Built with ❤️ using MERN Stack
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SettingsPanel;
