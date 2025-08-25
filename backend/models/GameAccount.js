const mongoose = require('mongoose');

const gameAccountSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  gameName: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  rank: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Fresh', 'First Owner', 'Cheated'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  screenshots: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('GameAccount', gameAccountSchema);