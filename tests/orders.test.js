// tests/orders.test.js
jest.setTimeout(20000);

const request               = require('supertest');
const mongoose              = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt                   = require('jsonwebtoken');

const app     = require('../server');           // your Express app
const User    = require('../models/userModel');
const Product = require('../models/productModel');
const Order   = require('../models/orderModel');

let mongoServer;
let userToken;
let adminToken;
let userId;
let testProduct;
let createdOrderId;

beforeAll(async () => {
  // 1️⃣ Start in‐memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri   = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'test' });

  // 2️⃣ Seed one product into the DB
  testProduct = await Product.create({
    id:          1234,
    name:        'OrderTest Product',
    description: 'Seeded for orders tests',
    price:       25,
    type:        'OTC'
  });

  // 3️⃣ Sign up a normal user & log in
  await request(app)
    .post('/api/auth/signup')
    .send({
      email:     'alice@example.com',
      password:  'Password1!',
      firstName: 'Alice'
    })
    .expect(201);

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email:    'alice@example.com',
      password: 'Password1!'
    })
    .expect(200);

  userToken = loginRes.body.token;
  userId    = jwt.decode(userToken).id;

  // 4️⃣ Create an admin user directly and issue them a token
  const admin = await User.create({
    email:     'admin@example.com',
    password:  'AdminPass1!',
    firstName: 'Super',
    role:      'admin'
  });
  adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
});

afterAll(async () => {
  // 5️⃣ Tear down
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('📦 Orders API', () => {
  it('GET /api/orders → empty list for new user', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it('POST /api/orders → place a new order', async () => {
    const payload = {
      items: [
        { productId: testProduct._id, quantity: 2 }
      ],
      doctorFee: 5
    };

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(201);

    // remember the newly created order’s id
    createdOrderId = res.body._id;

    expect(res.body).toHaveProperty('user', userId);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.totalAmount).toBe(testProduct.price * 2 + 5);
    expect(res.body.paymentDetails).toMatchObject({ doctorFee: 5 });
  });

  it('GET /api/orders → list one order', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]._id).toBe(createdOrderId);
  });

  it('GET /api/orders/:id → fetch single order', async () => {
    const res = await request(app)
      .get(`/api/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('_id', createdOrderId);
    expect(res.body).toHaveProperty('user', userId);
  });

  it('PUT /api/orders/:id/status → forbidden for regular user', async () => {
    await request(app)
      .put(`/api/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'completed' })
      .expect(403);
  });

  it('PUT /api/orders/:id/status → allows admin to update status', async () => {
    const res = await request(app)
      .put(`/api/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'completed' })
      .expect(200);

    expect(res.body).toHaveProperty('status', 'completed');
  });

  it('DELETE /api/orders/:id → allow user to cancel (delete) own order', async () => {
    await request(app)
      .delete(`/api/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204);

    const listRes = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body).toHaveLength(0);
  });
});
