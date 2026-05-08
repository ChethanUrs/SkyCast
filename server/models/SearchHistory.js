const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for anonymous searches
    },
    sessionId: {
      type: String,
      default: null, // for anonymous tracking
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    cityName: String,
    country: String,
    lat: Number,
    lon: Number,
    weatherSnapshot: {
      temperature: Number,
      description: String,
      icon: String,
    },
  },
  {
    timestamps: true,
  }
);

searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ sessionId: 1, createdAt: -1 });
// Auto-expire anonymous searches after 7 days
searchHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800, partialFilterExpression: { userId: null } });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
