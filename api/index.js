require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', debug: true, path: 'api/index.js' });
});

// Routes - Fixed relative paths
try {
  const weatherRoutes = require('../server/routes/weather');
  app.use('/api/weather', weatherRoutes);
} catch (err) {
  console.error('Weather routes failed:', err);
}

module.exports = app;
