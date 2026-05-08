const User = require('../models/User');
const mockStorage = require('../services/mockStorage');
const mongoose = require('mongoose');
const { generateToken } = require('../middleware/auth');
const passport = require('passport');
const { z } = require('zod');

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Helper to get correct storage based on DB status
const getStorage = () => {
  return mongoose.connection.readyState === 1 ? User : mockStorage.users;
};

// ─── Register ─────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const storage = getStorage();
    const existingUser = await storage.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    const user = await storage.create({ name, email, passwordHash: password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const storage = getStorage();
    const user = await storage.findOne({ email }); // Note: mock findOne doesn't need .select
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (mongoose.connection.readyState === 1) {
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Current User ─────────────────────────────────────────
const getMe = async (req, res) => {
  const userData = typeof req.user.toPublicJSON === 'function' 
    ? req.user.toPublicJSON() 
    : req.user;
  res.json({ success: true, user: userData });
};

// ─── Update Profile ───────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const storage = getStorage();
    const user = await storage.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// ─── Change Password ──────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (user.passwordHash && !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.passwordHash = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── Google OAuth Callback ────────────────────────────────────
const googleCallback = async (req, res) => {
  const token = generateToken(req.user._id);
  // Redirect to frontend with token
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
};

const demoLogin = async (req, res, next) => {
  try {
    const storage = getStorage();
    const email = 'demo@skycast.ai';
    
    let user = await storage.findOne({ email });
    if (!user) {
      user = await storage.create({
        name: 'Demo Explorer',
        email,
        passwordHash: 'demo123',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
      });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Logged in to Demo Mode!',
      token,
      user: typeof user.toPublicJSON === 'function' ? user.toPublicJSON() : user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  googleCallback,
  demoLogin,
};
