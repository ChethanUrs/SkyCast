const User = require('../models/User');

// ─── GET /api/preferences ─────────────────────────────────────
const getPreferences = async (req, res) => {
  res.json({ success: true, data: req.user.preferences });
};

// ─── PATCH /api/preferences ───────────────────────────────────
const updatePreferences = async (req, res, next) => {
  try {
    const allowedFields = [
      'temperatureUnit', 'windUnit', 'timeFormat',
      'theme', 'language', 'notificationsEnabled', 'severeWeatherAlerts',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[`preferences.${field}`] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid preference fields provided.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user.preferences });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPreferences, updatePreferences };
