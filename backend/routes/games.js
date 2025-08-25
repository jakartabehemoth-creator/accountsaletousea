const express = require('express');
const Game = require('../models/Game');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find().populate('createdBy', 'username');
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new game (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name } = req.body;
    
    const game = new Game({
      name,
      icon: `/assets/${name.toLowerCase()}.png`,
      createdBy: req.user._id
    });

    await game.save();
    await game.populate('createdBy', 'username');
    
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete game (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;