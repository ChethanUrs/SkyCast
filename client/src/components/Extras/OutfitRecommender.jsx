import React from 'react';
import { motion } from 'framer-motion';

// ── Fallback local logic (used when Gemini is not configured) ─────────────────
const getFallbackOutfit = (temp, description) => {
  const d = description?.toLowerCase() || '';
  const isRainy = d.includes('rain') || d.includes('drizzle') || d.includes('shower');
  const isSnowy = d.includes('snow');
  const isStormy = d.includes('thunder') || d.includes('storm');

  if (isStormy) return { emoji: '⛈️', label: 'Stay Home!', items: ['Heavy raincoat', 'Waterproof boots', 'Stay indoors'], color: '#7c3aed' };
  if (isSnowy || temp < 0) return { emoji: '🧥', label: 'Bundle Up!', items: ['Heavy winter coat', 'Thermal layers', 'Gloves & scarf', 'Snow boots'], color: '#818cf8' };
  if (temp < 10) return { emoji: '🧣', label: 'Dress Warm', items: ['Winter jacket', 'Long sleeves', 'Warm pants', 'Closed shoes'], color: '#6366f1' };
  if (isRainy) return { emoji: '🌂', label: 'Rain Gear', items: ['Rain jacket', 'Umbrella', 'Waterproof shoes', 'Light layers'], color: '#22d3ee' };
  if (temp < 18) return { emoji: '👕', label: 'Layer Up', items: ['Light jacket or hoodie', 'Jeans', 'Sneakers'], color: '#34d399' };
  if (temp < 26) return { emoji: '😎', label: 'Comfortable', items: ['T-shirt & light pants', 'Sneakers or sandals', 'Light layer for evening'], color: '#f59e0b' };
  return { emoji: '☀️', label: 'Light & Breezy', items: ['Light breathable clothing', 'Sunscreen & sunglasses', 'Cap or hat', 'Sandals'], color: '#f97316' };
};

const getFallbackActivity = (temp, weatherCode) => {
  if (weatherCode >= 95) return { suggestion: '🏠 Stay in & cozy up', reason: 'Thunderstorm warning', icon: '⛈️' };
  if (weatherCode >= 71 && weatherCode < 78) return { suggestion: '⛷️ Skiing or snowboarding', reason: "It's snowing!", icon: '🏔️' };
  if (weatherCode >= 51 && weatherCode < 70) return { suggestion: '🏋️ Indoor gym session', reason: 'Rainy day — great for indoors', icon: '🌧️' };
  if (temp > 28) return { suggestion: '🏊 Beach or pool day', reason: "It's hot — stay near water", icon: '☀️' };
  if (temp > 20 && weatherCode < 2) return { suggestion: '🥾 Hiking or cycling', reason: 'Perfect clear weather', icon: '🌞' };
  if (temp > 15) return { suggestion: '🏃 Morning run or walk', reason: 'Pleasant temperature', icon: '🌤️' };
  return { suggestion: '☕ Café or study day', reason: 'Cool and comfortable inside', icon: '🌥️' };
};

const OutfitRecommender = ({ weather, aiRecs }) => {
  if (!weather) return null;

  // Use Gemini AI recommendations if available, else fallback
  const outfit = aiRecs?.outfit || getFallbackOutfit(weather.temperature, weather.description);
  const activity = aiRecs?.activity || getFallbackActivity(weather.temperature, weather.weatherCode);
  const alert = aiRecs?.alert;
  const isAI = !!aiRecs;

  const outfitColor = outfit.color || '#6366f1';

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: 'var(--space-6)' }}
      id="outfit-recommender"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-5)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          👗 What to Wear & Do Today
        </h3>
        {isAI && (
          <span style={{
            fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em',
            background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
            color: '#fff', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600,
          }}>
            ✨ AI
          </span>
        )}
      </div>

      {/* Alert banner */}
      {alert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            marginBottom: 16, padding: '10px 14px', borderRadius: 'var(--radius-lg)',
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)',
            color: '#f59e0b', fontSize: '0.875rem', display: 'flex', gap: 8, alignItems: 'center',
          }}
        >
          ⚠️ {alert}
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Outfit */}
        <div style={{
          background: `${outfitColor}15`,
          border: `1px solid ${outfitColor}35`,
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>{outfit.emoji}</div>
          <div style={{ fontWeight: 700, color: outfitColor, marginBottom: 10, fontSize: '1rem' }}>{outfit.label}</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {(outfit.items || []).map((item) => (
              <li key={item} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ color: outfitColor }}>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Activity */}
        <div style={{
          background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>{activity.icon}</div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontSize: '1rem' }}>
            {activity.suggestion}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{activity.reason}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default OutfitRecommender;
