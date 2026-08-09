const express = require('express');
const Watchlist = require('../models/Watchlist');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET all watchlist items for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Watchlist.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// ADD a new region to watchlist
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { regionName, latitude, longitude, radiusKm } = req.body;

    if (!regionName || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Region name, latitude, and longitude are required' });
    }

    const newItem = new Watchlist({
      userId: req.userId,
      regionName,
      latitude,
      longitude,
      radiusKm: radiusKm || 20
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Add watchlist error:', error);
    res.status(500).json({ error: 'Failed to add region' });
  }
});

// DELETE a watchlist item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Watchlist.findOne({ _id: req.params.id, userId: req.userId });

    if (!item) {
      return res.status(404).json({ error: 'Watchlist item not found' });
    }

    await Watchlist.deleteOne({ _id: req.params.id });
    res.json({ message: 'Region removed from watchlist' });
  } catch (error) {
    console.error('Delete watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove region' });
  }
});

module.exports = router;