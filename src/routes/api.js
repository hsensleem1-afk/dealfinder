const express = require('express');
const router = express.Router();

// Example route
router.get('/deals', (req, res) => {
  res.json({ message: 'Get all deals', deals: [] });
});

// Example route with parameter
router.get('/deals/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Get deal ${id}`, deal: null });
});

// Example POST route
router.post('/deals', (req, res) => {
  res.status(201).json({ message: 'Deal created', deal: req.body });
});

module.exports = router;
