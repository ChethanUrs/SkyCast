const User = require('../models/User');
const mockStorage = require('../services/mockStorage');
const mongoose = require('mongoose');

const getStorage = () => mongoose.connection.readyState === 1 ? User : mockStorage.users;

// ─── GET /api/locations ───────────────────────────────────────
const getLocations = async (req, res, next) => {
  try {
    const storage = getStorage();
    const user = await storage.findById(req.user._id);
    const locations = user.savedLocations || [];
    const sorted = locations.sort((a, b) => a.order - b.order);
    res.json({ success: true, data: sorted });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/locations ──────────────────────────────────────
const addLocation = async (req, res, next) => {
  try {
    const { cityName, country, state, lat, lon } = req.body;

    if (!cityName || lat == null || lon == null) {
      return res.status(400).json({ success: false, message: 'cityName, lat, and lon are required.' });
    }

    const storage = getStorage();
    const user = await storage.findById(req.user._id);
    if (!user.savedLocations) user.savedLocations = [];

    // Max 10 saved locations
    if (user.savedLocations.length >= 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 saved locations reached.' });
    }

    // Check for duplicate
    const isDuplicate = user.savedLocations.some(
      (loc) => Math.abs(loc.lat - lat) < 0.01 && Math.abs(loc.lon - lon) < 0.01
    );
    if (isDuplicate) {
      return res.status(409).json({ success: false, message: 'Location already saved.' });
    }

    const order = user.savedLocations.length;
    const newLocation = { cityName, country, state, lat, lon, order };
    
    if (mongoose.connection.readyState === 1) {
      // Real MongoDB: Let Mongoose generate the ObjectId
      user.savedLocations.push(newLocation);
      await user.save();
    } else {
      // Mock Storage: Add a manual string ID
      newLocation._id = 'loc_' + Date.now();
      user.savedLocations.push(newLocation);
      await storage.findByIdAndUpdate(req.user._id, { savedLocations: user.savedLocations });
    }

    res.status(201).json({
      success: true,
      message: `${cityName} added to favorites!`,
      data: user.savedLocations,
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/locations/:locationId ───────────────────────
const removeLocation = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const storage = getStorage();
    const user = await storage.findById(req.user._id);
    if (!user.savedLocations) user.savedLocations = [];

    const index = user.savedLocations.findIndex((l) => l._id.toString() === locationId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Location not found.' });
    }

    user.savedLocations.splice(index, 1);
    // Re-order remaining
    user.savedLocations.forEach((loc, i) => { loc.order = i; });
    
    if (mongoose.connection.readyState === 1) {
      await user.save();
    } else {
      await storage.findByIdAndUpdate(req.user._id, { savedLocations: user.savedLocations });
    }

    res.json({ success: true, message: 'Location removed.', data: user.savedLocations });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/locations/reorder ────────────────────────────
const reorderLocations = async (req, res, next) => {
  try {
    const { ids } = req.body; // Array of location _id strings in new order
    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'ids must be an array.' });
    }

    const storage = getStorage();
    const user = await storage.findById(req.user._id);
    if (!user.savedLocations) user.savedLocations = [];
    ids.forEach((id, index) => {
      const loc = user.savedLocations.find((l) => l._id.toString() === id);
      if (loc) loc.order = index;
    });

    if (mongoose.connection.readyState === 1) {
      await user.save();
    } else {
      await storage.findByIdAndUpdate(req.user._id, { savedLocations: user.savedLocations });
    }
    res.json({ success: true, data: user.savedLocations.sort((a, b) => a.order - b.order) });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLocations, addLocation, removeLocation, reorderLocations };
