const mongoose = require('mongoose');

const fireSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  brightness: {
    type: Number
  },
  confidence: {
    type: String
  },
  acquiredDate: {
    type: String
  },
  acquiredTime: {
    type: String
  },
  satellite: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}, { timestamps: true });

// Geospatial index - isse hum location-based queries kar sakte hain
fireSchema.index({ location: '2dsphere' });

const Fire = mongoose.model('Fire', fireSchema);

module.exports = Fire;