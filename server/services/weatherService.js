/**
 * SkyCast Weather Service
 * ───────────────────────
 * Real-time data  → Open-Meteo API   (100% free, no key)
 * AI summaries    → Google Gemini    (free at aistudio.google.com)
 * Geocoding       → Open-Meteo geocoding (also free, no key)
 */

const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600 }); // 10-min cache

// ── Gemini setup ─────────────────────────────────────────────────────────────
let geminiModel = null;
try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    console.log('✨ Gemini AI initialized successfully');
  }
} catch (e) {
  console.error('❌ Gemini init error:', e.message);
}

// ── Base URLs ─────────────────────────────────────────────────────────────────
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1';
const WEATHER_URL = 'https://api.open-meteo.com/v1';
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1';

// ── WMO weather code → description + icon emoji ──────────────────────────────
const WMO_CODES = {
  0: { desc: 'Clear sky', icon: '☀️', owmIcon: '01d' },
  1: { desc: 'Mainly clear', icon: '🌤️', owmIcon: '02d' },
  2: { desc: 'Partly cloudy', icon: '⛅', owmIcon: '03d' },
  3: { desc: 'Overcast', icon: '☁️', owmIcon: '04d' },
  45: { desc: 'Foggy', icon: '🌫️', owmIcon: '50d' },
  48: { desc: 'Icy fog', icon: '🌫️', owmIcon: '50d' },
  51: { desc: 'Light drizzle', icon: '🌦️', owmIcon: '09d' },
  53: { desc: 'Drizzle', icon: '🌦️', owmIcon: '09d' },
  55: { desc: 'Dense drizzle', icon: '🌧️', owmIcon: '09d' },
  61: { desc: 'Slight rain', icon: '🌧️', owmIcon: '10d' },
  63: { desc: 'Moderate rain', icon: '🌧️', owmIcon: '10d' },
  65: { desc: 'Heavy rain', icon: '🌧️', owmIcon: '10d' },
  71: { desc: 'Slight snow', icon: '🌨️', owmIcon: '13d' },
  73: { desc: 'Moderate snow', icon: '🌨️', owmIcon: '13d' },
  75: { desc: 'Heavy snow', icon: '❄️', owmIcon: '13d' },
  77: { desc: 'Snow grains', icon: '🌨️', owmIcon: '13d' },
  80: { desc: 'Slight showers', icon: '🌦️', owmIcon: '09d' },
  81: { desc: 'Moderate showers', icon: '🌧️', owmIcon: '09d' },
  82: { desc: 'Violent showers', icon: '⛈️', owmIcon: '11d' },
  85: { desc: 'Snow showers', icon: '🌨️', owmIcon: '13d' },
  86: { desc: 'Heavy snow showers', icon: '❄️', owmIcon: '13d' },
  95: { desc: 'Thunderstorm', icon: '⛈️', owmIcon: '11d' },
  96: { desc: 'Thunderstorm with hail', icon: '⛈️', owmIcon: '11d' },
  99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️', owmIcon: '11d' },
};

const getWMO = (code) => WMO_CODES[code] || { desc: 'Unknown', icon: '🌡️', owmIcon: '01d' };

// ── Wind direction degrees → cardinal ────────────────────────────────────────
const degToCardinal = (deg) => {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
};

// ── Format sunrise/sunset timestamp ──────────────────────────────────────────
const formatTime = (iso, timeFormat = '12h') => {
  if (!iso) return null;
  const is12h = timeFormat === '12h';
  return new Date(iso).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: is12h 
  });
};

// ── GEOCODING — city name → { lat, lon, name, country } ─────────────────────
async function geocodeCity(cityName) {
  const cacheKey = `geo:${cityName.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${GEO_URL}/search`, {
    params: { name: cityName, count: 5, language: 'en', format: 'json' },
  });

  if (!data.results?.length) throw new Error(`City not found: "${cityName}"`);

  const result = data.results.map((r) => ({
    cityName: r.name,
    state: r.admin1 || null,
    country: r.country,
    countryCode: r.country_code,
    lat: r.latitude,
    lon: r.longitude,
    population: r.population,
  }));

  cache.set(cacheKey, result);
  return result;
}

// ── REVERSE GEOCODING — lat/lon → city name ───────────────────────────────────
async function reverseGeocode(lat, lon) {
  const cacheKey = `revgeo:${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // Use nominatim for reverse geocoding (also free, no key)
    const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon, format: 'json' },
      headers: { 'User-Agent': 'SkyCast-App/1.0' },
      timeout: 5000,
    });
    const result = {
      cityName: data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown',
      state: data.address?.state || null,
      country: data.address?.country || '',
      countryCode: data.address?.country_code?.toUpperCase() || '',
    };
    cache.set(cacheKey, result);
    return result;
  } catch {
    return { cityName: 'Your Location', state: null, country: '', countryCode: '' };
  }
}

// ── CURRENT WEATHER ───────────────────────────────────────────────────────────
async function getCurrentWeather({ lat, lon, cityName, country, countryCode, unit = 'celsius', windUnit = 'kmh', timeFormat = '12h' }) {
  const tempUnit = unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';

  const { data } = await axios.get(`${WEATHER_URL}/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
        'weather_code', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
        'surface_pressure', 'cloud_cover', 'visibility', 'precipitation',
        'rain', 'snowfall', 'uv_index', 'is_day',
      ].join(','),
      daily: ['sunrise', 'sunset', 'temperature_2m_max', 'temperature_2m_min'].join(','),
      temperature_unit: tempUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
      wind_speed_unit: windUnit === 'knots' ? 'kn' : windUnit,
      timezone: 'auto',
      forecast_days: 1,
    },
    timeout: 10000,
  });

  const c = data.current;
  const d = data.daily;
  const wmo = getWMO(c.weather_code);
  const isDay = c.is_day === 1;

  // Convert to Kelvin if requested
  const toKelvin = (c) => Math.round(c + 273.15);
  const isKelvin = unit === 'kelvin';

  return {
    cityName,
    country,
    countryCode,
    lat,
    lon,
    temperature: isKelvin ? toKelvin(c.temperature_2m) : Math.round(c.temperature_2m),
    feelsLike: isKelvin ? toKelvin(c.apparent_temperature) : Math.round(c.apparent_temperature),
    tempMax: isKelvin ? toKelvin(d.temperature_2m_max?.[0] ?? c.temperature_2m) : Math.round(d.temperature_2m_max?.[0] ?? c.temperature_2m),
    tempMin: isKelvin ? toKelvin(d.temperature_2m_min?.[0] ?? c.temperature_2m) : Math.round(d.temperature_2m_min?.[0] ?? c.temperature_2m),
    humidity: c.relative_humidity_2m,
    description: wmo.desc,
    icon: isDay ? wmo.owmIcon : wmo.owmIcon.replace('d', 'n'),
    weatherCode: c.weather_code,
    weatherIcon: wmo.icon,
    windSpeed: Math.round(c.wind_speed_10m),
    windGust: c.wind_gusts_10m ? Math.round(c.wind_gusts_10m) : null,
    windDirection: degToCardinal(c.wind_direction_10m),
    windDeg: c.wind_direction_10m,
    pressure: Math.round(c.surface_pressure),
    cloudiness: c.cloud_cover,
    visibility: c.visibility ? Math.round(c.visibility / 1000) : null,
    uvIndex: c.uv_index,
    sunrise: formatTime(d.sunrise?.[0], timeFormat),
    sunset: formatTime(d.sunset?.[0], timeFormat),
    isDay,
    timezone: data.timezone,
    timezoneAbbreviation: data.timezone_abbreviation || 'UTC',
    utcOffsetSeconds: data.utc_offset_seconds !== undefined ? data.utc_offset_seconds : 0,
    unit: isKelvin ? 'K' : tempUnit,
    windUnit: windUnit === 'knots' ? 'kn' : windUnit,
  };
}

// ── FORECAST — hourly + daily ─────────────────────────────────────────────────
async function getForecast({ lat, lon, unit = 'celsius', windUnit = 'kmh', timeFormat = '12h' }) {
  const tempUnit = unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';

  const { data } = await axios.get(`${WEATHER_URL}/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      hourly: [
        'temperature_2m', 'relative_humidity_2m', 'precipitation_probability',
        'weather_code', 'wind_speed_10m', 'visibility',
      ].join(','),
      daily: [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'precipitation_probability_max', 'wind_speed_10m_max',
        'sunrise', 'sunset',
      ].join(','),
      temperature_unit: tempUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
      wind_speed_unit: windUnit === 'knots' ? 'kn' : windUnit,
      timezone: 'auto',
      forecast_days: 7,
    },
    timeout: 10000,
  });

  const isKelvin = unit === 'kelvin';
  const toKelvin = (c) => Math.round(c + 273.15);

  const now = new Date();

  // Hourly — next 24 entries from current hour
  const hourlyStartIdx = data.hourly.time.findIndex((t) => new Date(t) >= now);
  const startIdx = hourlyStartIdx >= 0 ? hourlyStartIdx : 0;

  const hourly = data.hourly.time.slice(startIdx, startIdx + 24).map((time, i) => {
    const idx = startIdx + i;
    const wmo = getWMO(data.hourly.weather_code[idx]);
    const h = new Date(time).getHours();
    const isDay = h >= 6 && h < 20;
    return {
      time,
      unixTime: new Date(time).getTime(),
      temperature: isKelvin ? toKelvin(data.hourly.temperature_2m[idx]) : Math.round(data.hourly.temperature_2m[idx]),
      humidity: data.hourly.relative_humidity_2m[idx],
      pop: data.hourly.precipitation_probability[idx] ?? 0,
      weatherCode: data.hourly.weather_code[idx],
      description: wmo.desc,
      icon: isDay ? wmo.owmIcon : wmo.owmIcon.replace('d', 'n'),
      weatherIcon: wmo.icon,
      windSpeed: Math.round(data.hourly.wind_speed_10m[idx]),
    };
  });

  // Daily — 7 days
  const daily = data.daily.time.map((date, i) => {
    const wmo = getWMO(data.daily.weather_code[i]);
    const rawMax = data.daily.temperature_2m_max[i];
    const rawMin = data.daily.temperature_2m_min[i];
    const max = isKelvin ? toKelvin(rawMax) : Math.round(rawMax);
    const min = isKelvin ? toKelvin(rawMin) : Math.round(rawMin);
    return {
      date,
      tempMax: max,
      tempMin: min,
      avgTemp: Math.round((max + min) / 2),
      pop: data.daily.precipitation_probability_max[i] ?? 0,
      weatherCode: data.daily.weather_code[i],
      description: wmo.desc,
      icon: wmo.owmIcon,
      weatherIcon: wmo.icon,
      windSpeed: Math.round(data.daily.wind_speed_10m_max[i]),
      sunrise: formatTime(data.daily.sunrise[i], timeFormat),
      sunset: formatTime(data.daily.sunset[i], timeFormat),
    };
  });

  return { hourly, daily };
}

// ── AIR QUALITY ───────────────────────────────────────────────────────────────
async function getAirQuality({ lat, lon }) {
  try {
    const { data } = await axios.get(`${AIR_URL}/air-quality`, {
      params: {
        latitude: lat,
        longitude: lon,
        current: ['pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide', 'ozone', 'european_aqi'].join(','),
      },
      timeout: 8000,
    });

    const c = data.current;
    const aqi = c.european_aqi;

    // Map EU AQI (0-500) to 1-5 scale
    let aqiLevel;
    if (aqi <= 20) aqiLevel = 1;
    else if (aqi <= 40) aqiLevel = 2;
    else if (aqi <= 60) aqiLevel = 3;
    else if (aqi <= 80) aqiLevel = 4;
    else aqiLevel = 5;

    return {
      aqi: aqiLevel,
      aqiRaw: aqi,
      components: {
        pm2_5: c.pm2_5,
        pm10: c.pm10,
        no2: c.nitrogen_dioxide,
        o3: c.ozone,
        co: c.carbon_monoxide,
      },
    };
  } catch {
    return null;
  }
}

// ── GEMINI AI SUMMARY ─────────────────────────────────────────────────────────
async function getAISummary(weatherData, forecast) {
  if (!geminiModel) return null;

  try {
    const prompt = `You are a friendly weather assistant for SkyCast app.

Current weather in ${weatherData.cityName}, ${weatherData.country}:
- Temperature: ${weatherData.temperature}°${weatherData.unit === 'fahrenheit' ? 'F' : 'C'} (feels like ${weatherData.feelsLike}°)
- Condition: ${weatherData.description}
- Humidity: ${weatherData.humidity}%
- Wind: ${weatherData.windSpeed} km/h ${weatherData.windDirection}
- UV Index: ${weatherData.uvIndex}
- Visibility: ${weatherData.visibility} km
- Today's range: ${weatherData.tempMin}° – ${weatherData.tempMax}°

Next 7 days outlook: ${forecast?.daily?.slice(0, 3).map(d => d.description).join(', ')}

Give a short, engaging 2-sentence weather summary (conversational, not robotic). Then on a new line, give 1 specific outfit recommendation based on these conditions. Keep it under 60 words total. No markdown.`;

    const result = await geminiModel.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Gemini summary error:', err.message);
    return null;
  }
}

// ── GEMINI SMART OUTFIT + ACTIVITY ────────────────────────────────────────────
async function getAIRecommendations(weatherData) {
  if (!geminiModel) return null;

  try {
    const prompt = `You are a helpful AI assistant for a weather app called SkyCast.

Weather: ${weatherData.temperature}°C, ${weatherData.description}, humidity ${weatherData.humidity}%, wind ${weatherData.windSpeed} km/h, UV index ${weatherData.uvIndex ?? 'unknown'}.

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "outfit": {
    "label": "short label like 'Bundle Up' or 'Stay Cool'",
    "emoji": "one relevant emoji",
    "items": ["item1", "item2", "item3", "item4"],
    "color": "a hex color matching the vibe"
  },
  "activity": {
    "suggestion": "one fun activity suggestion",
    "reason": "short reason based on weather",
    "icon": "one emoji"
  },
  "alert": "one short weather tip or health alert if needed, or null"
}`;

    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text().trim()
      .replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini recommendations error:', err.message);
    return null;
  }
}

// ── CITY AUTOCOMPLETE SEARCH ──────────────────────────────────────────────────
async function searchCities(query) {
  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${GEO_URL}/search`, {
    params: { name: query, count: 8, language: 'en', format: 'json' },
  });

  const results = (data.results || []).map((r) => ({
    cityName: r.name,
    state: r.admin1 || null,
    country: r.country,
    countryCode: r.country_code,
    lat: r.latitude,
    lon: r.longitude,
    population: r.population,
  }));

  cache.set(cacheKey, results, 300); // 5-min cache for search
  return results;
}

// ── MAIN ENTRY — fetch everything ─────────────────────────────────────────────
async function getFullWeather({ lat, lon, city, unit = 'celsius', windUnit = 'kmh', timeFormat = '12h' }) {
  // 1. Initial coordinates (if provided)
  let coords = { 
    lat: lat != null ? parseFloat(lat) : NaN, 
    lon: lon != null ? parseFloat(lon) : NaN 
  };
  let geoInfo = {};

  // 2. Fallback to IP-based detection if no location provided
  if (!city && (isNaN(coords.lat) || isNaN(coords.lon))) {
    try {
      console.log('📍 No coordinates provided, attempting IP-based geolocation...');
      // Using ipapi.co as it supports HTTPS and is more reliable for serverless
      const ipRes = await axios.get('https://ipapi.co/json/', { timeout: 3000 });
      if (ipRes.data && !ipRes.data.error) {
        coords = { lat: ipRes.data.latitude, lon: ipRes.data.longitude };
        geoInfo = { 
          cityName: ipRes.data.city, 
          country: ipRes.data.country_name, 
          countryCode: ipRes.data.country_code 
        };
        console.log(`📍 Detected location from IP: ${geoInfo.cityName}, ${geoInfo.country}`);
      }
    } catch (err) {
      console.warn('⚠️ IP-based geolocation failed:', err.message);
    }
  }

  // 3. Last resort fallback (London) if everything else fails
  if (isNaN(coords.lat) || isNaN(coords.lon)) {
    console.log('📍 Using fallback location (London)');
    coords = { lat: 51.5074, lon: -0.1278 };
    geoInfo = { cityName: 'London', country: 'United Kingdom', countryCode: 'GB' };
  }

  if (city) {
    const results = await geocodeCity(city);
    coords = { lat: results[0].lat, lon: results[0].lon };
    geoInfo = results[0];
  } else {
    geoInfo = await reverseGeocode(coords.lat, coords.lon);
  }

  // Check cache for weather data only (not AI — AI always runs fresh)
  const weatherCacheKey = `weather:${coords.lat.toFixed(2)},${coords.lon.toFixed(2)},${unit},${windUnit},${timeFormat}`;
  let current, forecast, aqi;

  const cachedWeather = cache.get(weatherCacheKey);
  if (cachedWeather) {
    ({ current, forecast, aqi } = cachedWeather);
  } else {
    // Parallel fetch weather + AQI with individual error handling
    try {
      const results = await Promise.allSettled([
        getCurrentWeather({ ...coords, ...geoInfo, unit, windUnit, timeFormat }),
        getAirQuality(coords),
        getForecast({ ...coords, unit, windUnit, timeFormat })
      ]);

      current = results[0].status === 'fulfilled' ? results[0].value : null;
      aqi = results[1].status === 'fulfilled' ? results[1].value : null;
      forecast = results[2].status === 'fulfilled' ? results[2].value : null;

      if (!current) throw new Error('Failed to fetch current weather data');
      
      cache.set(weatherCacheKey, { current, forecast, aqi });
    } catch (err) {
      console.error('❌ Weather fetch error:', err.message);
      throw err;
    }
  }

  // Gemini AI enhancements (always fresh, non-blocking)
  const [aiSummary, aiRecs] = await Promise.all([
    getAISummary(current, forecast).catch(() => null),
    getAIRecommendations(current).catch(() => null),
  ]);

  return {
    current: { 
      ...current, 
      aqi, 
      aiSummary,
      utcOffsetSeconds: current?.utcOffsetSeconds,
      timezoneAbbreviation: current?.timezoneAbbreviation
    },
    forecast,
    aiRecommendations: aiRecs,
  };
}

module.exports = {
  getFullWeather,
  searchCities,
  geocodeCity,
  reverseGeocode,
};
