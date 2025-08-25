const express = require('express');
const GameAccount = require('../models/GameAccount');
const Game = require('../models/Game');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await GameAccount.find()
      .populate('gameId', 'name')
      .populate('createdBy', 'username');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get accounts by game ID
router.get('/game/:gameId', async (req, res) => {
  try {
    const accounts = await GameAccount.find({ gameId: req.params.gameId })
      .populate('gameId', 'name')
      .populate('createdBy', 'username');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new account (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { gameId, level, rank, status, price, description } = req.body;
    
    // Get game name
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const account = new GameAccount({
      gameId,
      gameName: game.name,
      level: parseInt(level),
      rank,
      status,
      price: parseFloat(price),
      description,
      screenshots: [],
      createdBy: req.user._id
    });

    await account.save();
    await account.populate(['gameId', 'createdBy']);
    
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete account (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const account = await GameAccount.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;