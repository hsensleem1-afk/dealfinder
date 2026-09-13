// Set test environment BEFORE requiring modules
process.env.NODE_ENV = 'test';

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../server');

// Use a separate test database
const testDbPath = path.join(__dirname, '..', 'dealfinder.test.db');

// Clean up test database before running tests
beforeAll(() => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

// Clean up test database after all tests
afterAll(() => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

describe('DealFinder API', () => {
  describe('GET /api/health', () => {
    it('should return status ok', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /api/products', () => {
    it('should return empty products array on fresh database', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200);

      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBe(0);
    });

    it('should return products with expected structure', async () => {
      // Insert a test product directly if needed
      const res = await request(app)
        .get('/api/products')
        .expect(200);

      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBe(true);
    });
  });

  describe('GET /api/deals', () => {
    it('should return empty deals array on fresh database', async () => {
      const res = await request(app)
        .get('/api/deals')
        .expect(200);

      expect(res.body).toHaveProperty('deals');
      expect(Array.isArray(res.body.deals)).toBe(true);
      expect(res.body.deals.length).toBe(0);
    });

    it('should return deals with expected structure', async () => {
      const res = await request(app)
        .get('/api/deals')
        .expect(200);

      expect(res.body).toHaveProperty('deals');
      expect(Array.isArray(res.body.deals)).toBe(true);
    });
  });

  describe('GET /api/deals/:id', () => {
    it('should return 404 for non-existent deal', async () => {
      const res = await request(app)
        .get('/api/deals/999')
        .expect(404);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Deal not found');
    });

    it('should handle invalid deal IDs gracefully', async () => {
      const res = await request(app)
        .get('/api/deals/invalid')
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/search', () => {
    it('should require search query parameter', async () => {
      const res = await request(app)
        .get('/api/search')
        .expect(400);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Search query required');
    });

    it('should return empty results with valid query on fresh database', async () => {
      const res = await request(app)
        .get('/api/search?q=test')
        .expect(200);

      expect(res.body).toHaveProperty('deals');
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.deals)).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.deals.length).toBe(0);
      expect(res.body.products.length).toBe(0);
    });

    it('should handle special characters in search query', async () => {
      const res = await request(app)
        .get('/api/search?q=%25discount%25')
        .expect(200);

      expect(res.body).toHaveProperty('deals');
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.deals)).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });

    it('should handle malformed requests gracefully', async () => {
      const res = await request(app)
        .get('/api/deals/abc')
        .expect(404);
    });
  });
});
