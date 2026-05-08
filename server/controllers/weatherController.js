const { getFullWeather, searchCities } = require('../services/weatherService');

// ── GET /api/weather?city=London  OR  ?lat=51.5&lon=-0.1 ─────────────────────
exports.getWeather = async (req, res, next) => {
  try {
    const { city, lat, lon, unit = 'celsius', windUnit = 'kmh', timeFormat = '12h' } = req.query;

    // We now allow empty params to trigger server-side IP detection
    const params = city 
      ? { city, unit, windUnit, timeFormat } 
      : (lat != null && lon != null ? { lat: parseFloat(lat), lon: parseFloat(lon), unit, windUnit, timeFormat } : { unit, windUnit, timeFormat });
    const data = await getFullWeather(params);

    res.json({ success: true, data });
  } catch (err) {
    if (err.message?.includes('not found')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ── GET /api/weather/search?q=Lon ────────────────────────────────────────────
exports.searchCities = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Query must be at least 2 characters.' });
    }

    const results = await searchCities(q.trim());
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};
