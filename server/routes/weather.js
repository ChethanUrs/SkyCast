const express = require('express');
const router = express.Router();
const { getWeather, searchCities } = require('../controllers/weatherController');

// Safe optional auth — passes through even without DB
const optionalAuth = (req, res, next) => {
  try {
    const { optionalAuth: mw } = require('../middleware/auth');
    if (typeof mw === 'function') return mw(req, res, next);
  } catch (_) {}
  next();
};

// GET /api/weather?city=London  OR  ?lat=&lon=
router.get('/', optionalAuth, getWeather);

// GET /api/weather/search?q=Lon
router.get('/search', searchCities);

module.exports = router;
