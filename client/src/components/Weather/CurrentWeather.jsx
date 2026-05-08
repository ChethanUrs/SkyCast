import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

const useCountUp = (target, duration = 1500) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target == null) return;
    const start = performance.now();
    const raf = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - elapsed, 3);
      setValue(Math.round(target * ease));
      if (elapsed < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target]);
  return value;
};

const getConditionBg = (weatherId, isNight) => {
  if (isNight) return 'linear-gradient(135deg, #06091a 0%, #0d1230 100%)';
  if (weatherId >= 200 && weatherId < 300) return 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 100%)'; // thunder
  if (weatherId >= 300 && weatherId < 600) return 'linear-gradient(135deg, #1e3a5f 0%, #2d4e7e 100%)'; // rain
  if (weatherId >= 600 && weatherId < 700) return 'linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%)'; // snow
  if (weatherId >= 700 && weatherId < 800) return 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)'; // fog
  if (weatherId === 800) return 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 50%, #f59e0b 100%)';      // clear
  return 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'; // clouds
};

const CurrentWeather = ({ data }) => {
  const { temperatureUnit } = useSelector((s) => s.settings);
  const animatedTemp = useCountUp(data?.temperature);

  if (!data) return null;

  const isNight = data.icon?.includes('n');
  const bg = getConditionBg(data.weatherId, isNight);
  const unitSymbol = temperatureUnit === 'fahrenheit' ? '°F' : temperatureUnit === 'kelvin' ? 'K' : '°C';

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: 'var(--space-8)', background: `${bg}`, position: 'relative', overflow: 'hidden' }}
      id="current-weather-card"
    >
      {/* Background decoration */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{
          position: 'absolute', right: -60, top: -60, width: 280, height: 280,
          borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#fff', marginBottom: 4 }}
          >
            📍 {data.cityName}{data.country ? `, ${data.country}` : ''}
          </motion.h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', textTransform: 'capitalize', fontSize: '1rem' }}>
            {data.description}
          </p>
        </div>

        <motion.img
          src={`https://openweathermap.org/img/wn/${data.icon}@4x.png`}
          alt={data.description}
          style={{ width: 100, height: 100, filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))' }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}
        >
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem, 12vw, 7rem)',
            fontWeight: 800, color: '#fff', lineHeight: 1,
            textShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}>
            {animatedTemp}{unitSymbol}
          </span>
        </motion.div>
        {data.feelsLike != null && (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginTop: 4 }}>
            Feels like {data.feelsLike}{unitSymbol} · {data.tempMin}{unitSymbol} / {data.tempMax}{unitSymbol}
          </p>
        )}
      </div>

      {/* Sunrise / Sunset */}
      {(data.sunrise || data.sunset) && (
        <div style={{ display: 'flex', gap: 24, marginTop: 20, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
          {data.sunrise && <span>🌅 {data.sunrise}</span>}
          {data.sunset && <span>🌇 {data.sunset}</span>}
        </div>
      )}
    </motion.div>
  );
};

export default CurrentWeather;
