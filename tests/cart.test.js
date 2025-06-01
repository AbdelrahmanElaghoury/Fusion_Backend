// tests/cart.test.js
jest.setTimeout(20000);

const request               = require('supertest');
const mongoose              = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt                   = require('jsonwebtoken');

const app     = require('../server');            // your Express app (exported from server.js)
const Product = require('../models/productModel');
const Cart    = require('../models/cartModel');

let mongoServer;
let token;
let userId;
let testProduct;

beforeAll(async () => {
  // 1️⃣ Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri   = mongoServer.getUri();

  // 2️⃣ Connect mongoose to it
  await mongoose.connect(uri, {
    dbName: 'test',
  });

  // 3️⃣ Full auth flow: signup → login → grab token
  const signupRes = await request(app)
    .post('/api/auth/signup')
    .send({
      email:     'cartuser@example.com',
      password:  'CartPass123',
      firstName: 'CartUser'
    })
    .expect(201);

  // login immediately to get a token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email:    'cartuser@example.com',
      password: 'CartPass123'
    })
    .expect(200);

  token = loginRes.body.token;
  // decode token to extract userId
  userId = jwt.decode(token).id;

  // 4️⃣ Seed one product into the DB
  testProduct = await Product.create({
    id:          9999,
    name:        'Test Product',
    description: 'Just for cart tests',
    price:       42,
    type:        'OTC'
  });
});

afterAll(async () => {
  // 8️⃣ Teardown: drop test DB, disconnect, stop server
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('🛒 Cart API', () => {
  it('GET /api/cart → should start with empty items array', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('user', userId);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items).toHaveLength(0);
  });

  it('POST /api/cart → add an item', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct._id, quantity: 2 })
      .expect(201);

    expect(res.body).toHaveProperty('user', userId);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      product: String(testProduct._id),
      quantity: 2
    });
  });

  it('POST /api/cart again → same item increments quantity', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct._id, quantity: 3 })
      .expect(201);

    // now the cart should still have 1 line item, but quantity = 2 + 3 = 5
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      product: String(testProduct._id),
      quantity: 5
    });
  });

  it('PUT /api/cart/:productId → update quantity', async () => {
    const res = await request(app)
      .put(`/api/cart/${testProduct._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 })
      .expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      product: String(testProduct._id),
      quantity: 1
    });
  });

  it('DELETE /api/cart/:productId → remove single item', async () => {
    // remove the one item
    const res = await request(app)
      .delete(`/api/cart/${testProduct._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items).toHaveLength(0);
  });

  it('DELETE /api/cart → clear cart (idempotent)', async () => {
    // Add two items first
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct._id, quantity: 2 })
      .expect(201);

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct._id, quantity: 1 })
      .expect(201);

    // Now clear entire cart
    const res = await request(app)
      .delete('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items).toHaveLength(0);
  });
});
