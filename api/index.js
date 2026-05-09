require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const errorHandler = require('../server/middleware/errorHandler');
const { generalLimiter } = require('../server/middleware/rateLimiter');

// Route imports
const weatherRoutes = require('../server/routes/weather');
const authRoutes = require('../server/routes/auth');
const locationRoutes = require('../server/routes/locations');
const preferenceRoutes = require('../server/routes/preferences');
const passport = require('passport');
require('../server/config/passport');

const app = express();

// ─── Try connecting to MongoDB (async, non-blocking) ──────────────────────────
let dbConnected = false;
const connectDB = require('../server/config/db');
if (process.env.MONGODB_URI) {
  connectDB()
    .then(() => { dbConnected = true; })
    .catch((err) => {
      console.log('⚠️  DB connection background task failed:', err.message);
    });
}

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('short'));
app.use(passport.initialize());

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/weather', weatherRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/preferences', preferenceRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    dbConnected,
    weather: 'active',
    version: '1.0.4-clock'
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route [${req.method}] ${req.url} not found on this server.`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
