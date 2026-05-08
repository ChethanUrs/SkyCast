import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const getTimeGradient = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 8) return 'linear-gradient(135deg, #ff6b35 0%, #f7c59f 50%, #ffecd2 100%)';   // dawn
  if (h >= 8 && h < 17) return 'linear-gradient(135deg, #667eea 0%, #764ba2 40%, #3b82f6 100%)'; // day
  if (h >= 17 && h < 20) return 'linear-gradient(135deg, #fc5c7d 0%, #6a3093 50%, #1a0533 100%)'; // dusk
  return 'linear-gradient(135deg, #06091a 0%, #0d1230 50%, #080d22 100%)';                         // night
};

const Particle = ({ delay, x, size, duration }) => (
  <motion.div
    style={{
      position: 'absolute',
      left: `${x}%`,
      width: size, height: size,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(255,255,255,0.2)',
    }}
    animate={{ y: ['-10vh', '110vh'], opacity: [0, 0.7, 0], x: [`${x}%`, `${x + 5}%`, `${x - 3}%`] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
  />
);

const TypeWriter = ({ text, onDone }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, ++i));
      } else {
        clearInterval(interval);
        onDone?.();
      }
    }, 65);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayed}<span style={{ opacity: 0.6, animation: 'pulse-glow 1s infinite' }}>|</span></span>;
};

const SplashScreen = ({ onComplete }) => {
  const [taglineDone, setTaglineDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exit, setExit] = useState(false);
  const gradient = getTimeGradient();

  useEffect(() => {
    const steps = 30;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
      if (step >= steps) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (taglineDone && progress >= 100) {
      const t = setTimeout(() => {
        setExit(true);
        setTimeout(onComplete, 600);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [taglineDone, progress, onComplete]);

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 3,
    size: `${Math.random() * 30 + 10}px`, duration: Math.random() * 4 + 3,
  }));

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          className="splash-screen"
          style={{ background: gradient }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Ambient particles */}
          {particles.map((p) => <Particle key={p.id} {...p} />)}

          {/* Halo glow */}
          <motion.div
            style={{
              position: 'absolute', width: 300, height: 300, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Logo */}
          <motion.div
            style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Icon */}
            <motion.div
              style={{ fontSize: '5rem', marginBottom: '0.5rem', display: 'block' }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              🌤️
            </motion.div>

            {/* Logo text with shimmer */}
            <motion.h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(3rem, 8vw, 5rem)',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-0.03em',
                textShadow: '0 0 40px rgba(255,255,255,0.4)',
                position: 'relative',
                overflow: 'hidden',
                display: 'inline-block',
              }}
            >
              SkyCast
              {/* Shimmer sweep */}
              <motion.div
                style={{
                  position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                  skewX: '-20deg',
                }}
                animate={{ left: ['−100%', '200%'] }}
                transition={{ duration: 1.5, delay: 1.2, repeat: Infinity, repeatDelay: 2 }}
              />
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1.15rem',
                color: 'rgba(255,255,255,0.8)',
                letterSpacing: '0.05em',
                marginTop: '0.5rem',
                minHeight: '1.5rem',
              }}
            >
              <TypeWriter text="Your Sky, Your Way" onDone={() => setTaglineDone(true)} />
            </motion.p>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{ position: 'absolute', bottom: 60, width: '200px' }}
          >
            <div className="progress-bar-track" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <motion.div
                style={{
                  height: '100%', borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.8)',
                }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
