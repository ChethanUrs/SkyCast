import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { closeSidebar, openAuthModal, toggleSettings } from '../../store/uiSlice';
import { locationService } from '../../services/weatherApi';
import toast from 'react-hot-toast';

const Sidebar = ({ savedLocations, onLocationSelect, onLocationRemove }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { sidebarOpen } = useSelector((s) => s.ui);

  const handleRemove = async (id, name) => {
    try {
      await locationService.remove(id);
      onLocationRemove?.(id);
      toast.success(`${name} removed`);
    } catch (_) { toast.error('Failed to remove location'); }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 'var(--z-overlay)', backdropFilter: 'blur(4px)' }}
            onClick={() => dispatch(closeSidebar())}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            id="sidebar"
            style={{
              position: 'fixed', left: 0, top: 0, bottom: 0, width: 300,
              background: 'var(--bg-glass-strong)', backdropFilter: 'blur(30px)',
              borderRight: '1px solid var(--border-glass)',
              zIndex: 'calc(var(--z-overlay) + 1)', display: 'flex', flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)', overflowY: 'auto',
            }}
          >
            <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>🌤️ SkyCast</span>
                <button onClick={() => dispatch(closeSidebar())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.3rem' }}>✕</button>
              </div>
              {user ? (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                  }}>
                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.email}</div>
                  </div>
                </div>
              ) : (
                <button className="btn-primary" onClick={() => { dispatch(openAuthModal('login')); dispatch(closeSidebar()); }}
                  style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
                  Sign In
                </button>
              )}
            </div>

            {/* Saved Locations */}
            <div style={{ padding: 'var(--space-4) var(--space-6)', flex: 1 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                📍 Saved Locations {savedLocations?.length > 0 ? `(${savedLocations.length}/10)` : ''}
              </div>
              {!user ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sign in to save favorite locations.</p>
              ) : savedLocations?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No saved locations yet. Search for a city and save it!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {savedLocations.map((loc) => (
                    <motion.div
                      key={loc._id}
                      whileHover={{ x: 4 }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                      }}
                    >
                      <span onClick={() => { onLocationSelect?.(loc); dispatch(closeSidebar()); }}
                        style={{ color: 'var(--text-primary)', fontWeight: 500, flex: 1, fontSize: '0.9rem' }}>
                        📍 {loc.cityName}, {loc.country}
                      </span>
                      <button
                        onClick={() => handleRemove(loc._id, loc.cityName)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', fontSize: '0.9rem', padding: '0 4px' }}
                      >✕</button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings link */}
            <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--border-subtle)' }}>
              <button className="btn-ghost" onClick={() => { dispatch(toggleSettings()); dispatch(closeSidebar()); }}
                style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }} id="open-settings-btn">
                ⚙️ Settings
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
