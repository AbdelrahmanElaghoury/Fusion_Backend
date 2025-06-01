// tests/products.test.js
jest.setTimeout(20000);
require('dotenv').config();

const mongoose              = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request               = require('supertest');
const rawProducts           = require('../data/products');
const Product               = require('../models/productModel');
const app                   = require('../app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri   = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.DB_NAME      = 'test';

  // connect mongoose
  await mongoose.connect(uri, { dbName: 'test' });

  // seed
  await Product.deleteMany({});
  const toInsert = rawProducts.map(p => ({ ...p, type: p.Type }));
  await Product.insertMany(toInsert);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Products API', () => {
  it('GET /api/products → all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(rawProducts.length);
  });

  it('GET /api/products?concern=Acne → filtered', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ concern: 'Acne' });

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach(p => expect(p.concerns).toContain('Acne'));
  });

  it('GET /api/products/:id → single product', async () => {
    const target = rawProducts[2]; // id == 3
    const res    = await request(app).get(`/api/products/${target.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', target.id);
    expect(res.body).toHaveProperty('name', target.name);
  });

  it('GET /api/products/9999 → 404', async () => {
    const res = await request(app).get('/api/products/9999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Product 9999 not found');
  });
});
