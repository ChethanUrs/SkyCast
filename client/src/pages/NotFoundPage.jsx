import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: '7rem', marginBottom: '1rem' }}
      >
        🌪️
      </motion.div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, marginBottom: '0.5rem' }} className="text-gradient">
        404
      </h1>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
        Lost in the clouds!
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 360 }}>
        This page seems to have blown away. Let's get you back to clearer skies.
      </p>
      <Link to="/" className="btn-primary" style={{ display: 'inline-flex', padding: '13px 28px' }}>
        🌤️ Back to SkyCast
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
