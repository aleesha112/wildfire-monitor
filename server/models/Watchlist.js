const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  regionName: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  radiusKm: {
    type: Number,
    default: 20
  },
  lastAlertCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;