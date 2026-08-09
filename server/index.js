const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const cron = require('node-cron');
const axios = require('axios');
const csv = require('csv-parser');
const { Readable } = require('stream');
const Fire = require('./models/Fire');
const Watchlist = require('./models/Watchlist');
const User = require('./models/User');
const sendFireAlert = require('./utils/emailService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// Routes
const fireRoutes = require('./routes/fireRoutes');
app.use('/api/fires', fireRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const watchlistRoutes = require('./routes/watchlistRoutes');
app.use('/api/watchlist', watchlistRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Wildfire Monitor Backend is running! 🔥');
});

// ===== AUTO-UPDATE: Fetch fresh fire data =====
async function autoFetchFireData() {
  try {
    const MAP_KEY = process.env.FIRMS_API_KEY;
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/VIIRS_NOAA20_NRT/60.5,23.5,77.5,37.5/5`;

    const response = await axios.get(url);
    const csvData = response.data;
    const fires = [];
    const stream = Readable.from(csvData);

    stream
      .pipe(csv())
      .on('data', (row) => {
        fires.push({
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          brightness: parseFloat(row.bright_ti4),
          confidence: row.confidence,
          acquiredDate: row.acq_date,
          acquiredTime: row.acq_time,
          satellite: row.satellite,
          location: {
            type: 'Point',
            coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)]
          }
        });
      })
      .on('end', async () => {
        await Fire.deleteMany({});
        await Fire.insertMany(fires);
        console.log(`🔄 Auto-update: ${fires.length} fire records refreshed at ${new Date().toLocaleString()}`);

        // Check watchlists for nearby fires and send alerts
        await checkWatchlistAlerts(fires);
      });
  } catch (error) {
    console.error('❌ Auto-fetch error:', error.message);
  }
}


// Haversine formula - distance between two coordinates in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function checkWatchlistAlerts(fires) {
  try {
    const watchlistItems = await Watchlist.find().populate('userId');

    for (const item of watchlistItems) {
      if (!item.userId || !item.userId.email) continue;

      const nearbyFires = fires.filter(
        (f) => getDistanceKm(item.latitude, item.longitude, f.latitude, f.longitude) <= item.radiusKm
      );

      // Only send alert if the fire count has changed since last check
      if (nearbyFires.length > 0 && nearbyFires.length !== item.lastAlertCount) {
        await sendFireAlert(item.userId.email, item.regionName, nearbyFires.length, item.radiusKm);
        item.lastAlertCount = nearbyFires.length;
        await item.save();
      } else if (nearbyFires.length === 0 && item.lastAlertCount !== 0) {
        item.lastAlertCount = 0;
        await item.save();
      }
    }
  } catch (error) {
    console.error('❌ Watchlist alert check error:', error.message);
  }
}

// Run every day at 6:00 AM
cron.schedule('0 6 * * *', () => {
  console.log('⏰ Running scheduled fire data update...');
  autoFetchFireData();
});

// Run once immediately when server starts
autoFetchFireData();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;