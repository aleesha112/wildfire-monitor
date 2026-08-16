const express = require('express');
const axios = require('axios');
const csv = require('csv-parser');
const { Readable } = require('stream');
const Fire = require('../models/Fire');

const router = express.Router();

// Route: Fetch live fire data from NASA and save to DB
router.get('/fetch-live', async (req, res) => {
  try {
    const MAP_KEY = process.env.FIRMS_API_KEY;
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/VIIRS_NOAA20_NRT/60,5,80,40/5`;
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
        await Fire.insertMany(fires);
        res.json({ message: `${fires.length} fire records saved!`, count: fires.length });
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch fire data' });
  }
});

// Route: Get all saved fires from database
router.get('/', async (req, res) => {
  try {
    const fires = await Fire.find().sort({ createdAt: -1 });
    res.json(fires);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get fire data' });
  }
});

// Route: Detect high-risk zones (clusters of nearby fires)
router.get('/risk-zones', async (req, res) => {
  try {
    const fires = await Fire.find();
    const RADIUS_KM = 15; // fires within 15km of each other = same zone
    const MIN_FIRES_FOR_RISK = 3; // at least 3 fires nearby = high risk

    // Haversine formula - calculates real distance between 2 lat/long points
    function getDistanceKm(lat1, lon1, lat2, lon2) {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    const visited = new Array(fires.length).fill(false);
    const riskZones = [];

    for (let i = 0; i < fires.length; i++) {
      if (visited[i]) continue;

      const cluster = [fires[i]];
      visited[i] = true;

      for (let j = 0; j < fires.length; j++) {
        if (visited[j]) continue;
        const dist = getDistanceKm(
          fires[i].latitude, fires[i].longitude,
          fires[j].latitude, fires[j].longitude
        );
        if (dist <= RADIUS_KM) {
          cluster.push(fires[j]);
          visited[j] = true;
        }
      }

      if (cluster.length >= MIN_FIRES_FOR_RISK) {
        // Calculate center point of this cluster
        const avgLat = cluster.reduce((sum, f) => sum + f.latitude, 0) / cluster.length;
        const avgLon = cluster.reduce((sum, f) => sum + f.longitude, 0) / cluster.length;

        riskZones.push({
          centerLat: avgLat,
          centerLon: avgLon,
          fireCount: cluster.length,
          riskLevel: cluster.length >= 8 ? 'severe' : cluster.length >= 5 ? 'high' : 'moderate'
        });
      }
    }

    res.json(riskZones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to calculate risk zones' });
  }
});
// Route: Get fire data for a specific historical date
router.get('/historical', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required (format: YYYY-MM-DD)' });
    }

    const requestedDate = new Date(date);
    const today = new Date();
    if (requestedDate > today) {
      return res.status(400).json({ error: 'Cannot fetch data for future dates' });
    }

    // Earliest supported date (MODIS archive goes back to Nov 2000)
    const earliestDate = new Date('2000-11-01');
    if (requestedDate < earliestDate) {
      return res.status(400).json({ error: 'Data is not available before November 2000.' });
    }

    // Decide which satellite source to use based on how old the date is
    const daysAgo = Math.floor((today - requestedDate) / (1000 * 60 * 60 * 24));
    const MAP_KEY = process.env.FIRMS_API_KEY;

    // Recent dates (last ~60 days): use VIIRS NOAA-20 NRT (higher resolution, current satellite)
    // Older dates: use MODIS Standard Processing (archive, available back to 2000)
    const source = daysAgo <= 60 ? 'VIIRS_NOAA20_NRT' : 'MODIS_SP';

    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/${source}/60.5,23.5,77.5,37.5/1/${date}`;

    const response = await axios.get(url);
    const csvData = response.data;

    const fires = [];
    const stream = Readable.from(csvData);

    stream
      .pipe(csv())
      .on('data', (row) => {
        if (row.latitude && row.longitude) {
          fires.push({
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            brightness: parseFloat(row.bright_ti4 || row.brightness),
            confidence: row.confidence,
            acquiredDate: row.acq_date,
            acquiredTime: row.acq_time,
            satellite: row.satellite || source
          });
        }
      })
      .on('end', () => {
        res.json({ date, source, count: fires.length, fires });
      });

  } catch (error) {
    console.error('Historical fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch historical data for this date. NASA archive may be temporarily unavailable.' });
  }
});

module.exports = router;