import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { openAuthModal, toggleSidebar, setSearchExpanded } from '../../store/uiSlice';
import SearchBar from '../Search/SearchBar';

const ThemeToggle = ({ isDark, onToggle }) => (
  <motion.button
    onClick={onToggle}
    className="btn-ghost"
    style={{ width: 44, height: 44, padding: 0, borderRadius: '50%', fontSize: '1.2rem' }}
    whileTap={{ scale: 0.9 }}
    aria-label="Toggle theme"
    id="theme-toggle"
  >
    <AnimatePresence mode="wait">
      <motion.span
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? '☀️' : '🌙'}
      </motion.span>
    </AnimatePresence>
  </motion.button>
);

const Avatar = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--accent-primary)',
          background: user.avatar ? 'transparent' : 'var(--gradient-accent)',
          cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.85rem',
        }}
        id="user-avatar"
      >
        {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', right: 0, top: 48, minWidth: 180,
              background: 'var(--bg-glass-strong)', border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(20px)',
              boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 200,
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              style={{
                width: '100%', padding: '10px 16px', background: 'transparent',
                border: 'none', textAlign: 'left', cursor: 'pointer',
                color: 'var(--accent-danger)', fontSize: '0.9rem', fontFamily: 'var(--font-sans)',
              }}
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />}
    </div>
  );
};

const Navbar = ({ onSearch }) => {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const searchExpanded = useSelector((s) => s.ui.searchExpanded);

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <motion.button
          className="btn-ghost"
          onClick={() => dispatch(toggleSidebar())}
          style={{ width: 40, height: 40, padding: 0, borderRadius: '50%', fontSize: '1.1rem' }}
          whileTap={{ scale: 0.9 }}
          id="sidebar-toggle"
        >
          ☰
        </motion.button>
        <AnimatePresence>
          {!searchExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="navbar-logo"
            >
              🌤️ SkyCast
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div style={{ flex: 1, maxWidth: 500, margin: '0 16px' }}>
        <SearchBar onSearch={onSearch} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        {user ? (
          <Avatar user={user} onLogout={logout} />
        ) : (
          <>
            <button className="btn-ghost" onClick={() => dispatch(openAuthModal('login'))} id="login-btn" style={{ fontSize: '0.875rem' }}>
              Sign in
            </button>
            <button className="btn-primary" onClick={() => dispatch(openAuthModal('register'))} id="register-btn" style={{ fontSize: '0.875rem', padding: '8px 16px' }}>
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
