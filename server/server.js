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

// ─── Try connecting to MongoDB (optional — weather works without it) ─────────
let dbConnected = false;
const connectDB = require('./config/db');
connectDB()
  .then(() => { dbConnected = true; })
  .catch(() => {
    console.log('⚠️  MongoDB not available — auth & saved locations disabled.');
    console.log('   Weather API is fully functional without MongoDB.\n');
  });


// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(passport.initialize());

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ─── Core Routes (always available) ──────────────────────────────────────────
app.use('/api/weather', weatherRoutes);

// ─── Registered Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/preferences', preferenceRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SkyCast API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: dbConnected ? 'connected' : 'unavailable',
    gemini: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? 'configured' : 'not configured',
    weather: 'Open-Meteo (free, no key required)',
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server (Only if not running as a serverless function) ─────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🌤️  SkyCast API running on http://localhost:${PORT}`);
    console.log(`📡  Environment: ${process.env.NODE_ENV}`);
    console.log(`🌍  Weather: Open-Meteo (free, no API key needed)`);
    const hasGemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
    console.log(`✨  Gemini AI: ${hasGemini ? '✅ Active' : '⚠️  Not configured (add GEMINI_API_KEY to .env)'}`);
    console.log(`🔗  Client URL: ${process.env.CLIENT_URL}\n`);
  });
}

module.exports = app;
