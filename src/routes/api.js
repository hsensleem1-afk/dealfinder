const express = require('express');
const db = require('../db');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all products
router.get('/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get all deals
router.get('/deals', (req, res) => {
  try {
    const deals = db.prepare('SELECT * FROM deals').all();
    res.json({ deals });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Get deal by ID
router.get('/deals/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(id);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json({ deal });
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
});

// Search deals and products
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const searchTerm = `%${q}%`;
    const deals = db.prepare(
      'SELECT * FROM deals WHERE title LIKE ? OR description LIKE ?'
    ).all(searchTerm, searchTerm);
    const products = db.prepare(
      'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?'
    ).all(searchTerm, searchTerm);
    res.json({ deals, products });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
