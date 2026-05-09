require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Route imports
const weatherRoutes = require('./routes/weather');
const authRoutes = require('./routes/auth');
const locationRoutes = require('./routes/locations');
const preferenceRoutes = require('./routes/preferences');
const passport = require('passport');
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Try connecting to MongoDB (async, non-blocking) ──────────────────────────
let dbConnected = false;
const connectDB = require('./config/db');
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

// ─── Start Server (Only if not running as a serverless function) ─────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🌤️ SkyCast API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
