const express = require('express');
const router = express.Router();
const passport = require('passport');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  register, login, getMe, updateProfile, changePassword, googleCallback, demoLogin,
} = require('../controllers/authController');

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/demo', authLimiter, demoLogin);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth`, session: false }),
  googleCallback
);

// Protected routes
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.patch('/change-password', protect, changePassword);

module.exports = router;
