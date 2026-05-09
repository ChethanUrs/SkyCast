const express = require('express');
const router = express.Router();
const passport = require('passport');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  register, login, getMe, updateProfile, changePassword, demoLogin,
} = require('../controllers/authController');

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/demo', authLimiter, demoLogin);

// Placeholder for removed Google Login to prevent 404s
router.all(['/google', '/google/callback'], (req, res) => {
  res.status(503).json({ 
    success: false, 
    message: 'Google Login is currently disabled for maintenance. Please use Email/Password or the Demo login instead.' 
  });
});


// Protected routes
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.patch('/change-password', protect, changePassword);

module.exports = router;
