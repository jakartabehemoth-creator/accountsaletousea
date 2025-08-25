const express = require('express');
const PaymentMethod = require('../models/PaymentMethod');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all payment methods
router.get('/', async (req, res) => {
  try {
    const methods = await PaymentMethod.find().populate('createdBy', 'username');
    res.json(methods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new payment method (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, details } = req.body;
    
    const method = new PaymentMethod({
      name,
      details,
      icon: '💳',
      createdBy: req.user._id
    });

    await method.save();
    await method.populate('createdBy', 'username');
    
    res.status(201).json(method);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete payment method (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const method = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!method) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;