import React from 'react';
import { motion } from 'framer-motion';

const AISummaryCard = ({ summary }) => {
  if (!summary) return null;

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: 'var(--space-5) var(--space-6)',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
        border: '1px solid rgba(99,102,241,0.25)',
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
      }}
      id="ai-summary-card"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: '1.8rem', flexShrink: 0 }}
      >
        ✨
      </motion.div>
      <div>
        <div style={{
          fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em',
          color: 'var(--accent-primary)', fontWeight: 600, marginBottom: 6,
        }}>
          Gemini AI · Weather Insight
        </div>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65,
          fontStyle: 'italic',
        }}>
          "{summary}"
        </p>
      </div>
    </motion.div>
  );
};

export default AISummaryCard;
