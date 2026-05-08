import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { closeAuthModal, openAuthModal } from '../../store/uiSlice';
import toast from 'react-hot-toast';

const inputStyle = {
  width: '100%', marginBottom: 14,
};

const AuthModal = () => {
  const dispatch = useDispatch();
  const { authModalOpen, authModalMode } = useSelector((s) => s.ui);
  const { login, register, demoLogin } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isLogin = authModalMode === 'login';

  const validate = () => {
    const e = {};
    if (!isLogin && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Min 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back! 🌤️');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created! Welcome to SkyCast 🎉');
      }
      dispatch(closeAuthModal());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await demoLogin();
      toast.success('Logged in as Demo User! 🚀');
      dispatch(closeAuthModal());
    } catch (err) {
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!authModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => dispatch(closeAuthModal())}
        id="auth-modal-overlay"
      >
        <motion.div
          className="modal-content"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          id="auth-modal"
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 6 }}>
            {isLogin ? '👋 Welcome back' : '✨ Join SkyCast'}
          </h2>
          <p style={{ marginBottom: 24, fontSize: '0.9rem' }}>
            {isLogin ? 'Sign in to access your saved locations' : 'Create your account to save locations & preferences'}
          </p>

          {/* Google Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            id="google-login-btn"
            style={{
              width: '100%', padding: '11px 16px', marginBottom: 20,
              background: 'var(--bg-input)', border: '1px solid var(--border-input)',
              borderRadius: 'var(--radius-lg)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontWeight: 500,
              fontSize: '0.95rem', backdropFilter: 'blur(12px)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </motion.button>

          {/* Demo Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDemoLogin}
            disabled={loading}
            id="demo-login-btn"
            style={{
              width: '100%', padding: '11px 16px', marginBottom: 20,
              background: 'var(--gradient-accent)', border: 'none',
              borderRadius: 'var(--radius-lg)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 600,
              fontSize: '0.95rem', boxShadow: 'var(--shadow-md)',
            }}
          >
            <span>🚀</span> Try Demo Mode (Instant Access)
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <div style={inputStyle}>
                <input
                  className="neo-input"
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%' }}
                  id="register-name"
                />
                {errors.name && <p style={{ color: 'var(--accent-danger)', fontSize: '0.78rem', marginTop: 4 }}>{errors.name}</p>}
              </div>
            )}
            <div style={inputStyle}>
              <input
                className="neo-input"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                style={{ width: '100%' }}
                id="auth-email"
              />
              {errors.email && <p style={{ color: 'var(--accent-danger)', fontSize: '0.78rem', marginTop: 4 }}>{errors.email}</p>}
            </div>
            <div style={{ marginBottom: 24 }}>
              <input
                className="neo-input"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ width: '100%' }}
                id="auth-password"
              />
              {errors.password && <p style={{ color: 'var(--accent-danger)', fontSize: '0.78rem', marginTop: 4 }}>{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              id="auth-submit-btn"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
              ) : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => dispatch(openAuthModal(isLogin ? 'register' : 'login'))}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
