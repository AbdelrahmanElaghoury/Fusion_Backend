// tests/integration.test.js
jest.setTimeout(300000);

// load your prod‐style vars (point to your staging/test copy DB)
require('dotenv').config({ path: '.env.production' });

const request = require('supertest');
const mongoose = require('mongoose');
const jwt      = require('jsonwebtoken');

const app       = require('../server');            // exports your express app
const Product   = require('../models/productModel');
const Cart      = require('../models/cartModel');
const Order     = require('../models/orderModel');
const Question  = require('../models/questionModel');
const Profile   = require('../models/profileModel');
const Answer    = require('../models/answerModel');

describe('🛍️ Full API Integration (existing data)', () => {
  let userToken, adminToken, userId, adminId;
  let sampleProduct, orderId, questionSample;

  beforeAll(async () => {
    // 1) Connect to the target DB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });

    // 2) Ensure admin exists
    const aSign = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'int-admin@example.com', password: 'AdminPass1!', firstName: 'Admin', role: 'admin' })
      .catch(() => null);
    if (aSign?.body?.token) {
      adminToken = aSign.body.token;
    } else {
      const aLog = await request(app)
        .post('/api/auth/login')
        .send({ email: 'int-admin@example.com', password: 'AdminPass1!' });
      adminToken = aLog.body.token;
    }
    adminId = jwt.decode(adminToken).id;

    // 3) Ensure user exists
    const uSign = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'int-user@example.com', password: 'UserPass1!', firstName: 'User' })
      .catch(() => null);
    if (uSign?.body?.token) {
      userToken = uSign.body.token;
    } else {
      const uLog = await request(app)
        .post('/api/auth/login')
        .send({ email: 'int-user@example.com', password: 'UserPass1!' });
      userToken = uLog.body.token;
    }
    userId = jwt.decode(userToken).id;

    // 4) Grab a product & a question
    sampleProduct  = await Product.findOne({});
    questionSample = await Question.findOne({});
    if (!sampleProduct) throw new Error('No products in DB');
    if (!questionSample) throw new Error('No questions in DB');
  });

  afterAll(async () => {
    // clean up only what we created
    await Cart.deleteMany({ user: userId });
    await Order.deleteMany({ user: { $in: [userId, adminId] } });
    await Profile.deleteOne({ user: userId });
    await Answer.deleteMany({ user: userId });
    await mongoose.disconnect();
  });

  it('1️⃣ Products listing + filtering', async () => {
    const all = await request(app).get('/api/products').expect(200);
    expect(Array.isArray(all.body)).toBe(true);

    if (sampleProduct.concerns?.length) {
      const c = sampleProduct.concerns[0];
      const by = await request(app)
        .get('/api/products')
        .query({ concern: c })
        .expect(200);
      by.body.forEach(p => expect(p.concerns).toContain(c));
    }
  });

  it('2️⃣ Cart flow', async () => {
    // empty
    let res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.items).toHaveLength(0);

    // add
    res = await request(app)
      .post('/api/cart')
      .send({ productId: sampleProduct._id, quantity: 2 })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201);
    expect(res.body.items[0].quantity).toBe(2);

    // update
    res = await request(app)
      .put(`/api/cart/${sampleProduct._id}`)
      .send({ quantity: 5 })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.items[0].quantity).toBe(5);

    // remove
    res = await request(app)
      .delete(`/api/cart/${sampleProduct._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.items).toHaveLength(0);

    // clear idempotent
    await request(app)
      .delete('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201);
  });

  it('3️⃣ Questions API only reads', async () => {
    const allQ = await request(app).get('/api/questions').expect(200);
    expect(Array.isArray(allQ.body)).toBe(true);

    const pers = await request(app)
      .get('/api/questions')
      .query({ category: 'personal' })
      .expect(200);
    pers.body.forEach(q => expect(q.category).toBe('personal'));
  });

  it('4️⃣ User profile', async () => {
    // GET (auto-create)
    let me = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(me.body.userId.toString()).toBe(userId);

    // PATCH
    const upd = await request(app)
      .put('/api/profile')
      .send({ addresses: [{ label:'Home', line1:'1 Main', city:'X', state:'Y', postalCode:'123', country:'US' }] })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(upd.body.addresses).toHaveLength(1);

    // POST address
    const added = await request(app)
      .post('/api/profile/address')
      .send({ label:'Work', line1:'2 Side', city:'A', state:'B', postalCode:'456', country:'US' })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201);
    expect(added.body.addresses).toHaveLength(2);

    // DELETE index=0
    const rem = await request(app)
      .delete('/api/profile/address/0')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(rem.body.addresses.every(a => a.label !== 'Home')).toBe(true);
  });

  it('5️⃣ Answer submission & retrieval (upsert)', async () => {
    // first submit → 201
    let ans = await request(app)
      .post('/api/answers')
      .send({ questionId: questionSample._id, answer: 'first' })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201);

    // update same Q → 200
    ans = await request(app)
      .post('/api/answers')
      .send({ questionId: questionSample._id, answer: 'second' })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(ans.body.answer).toBe('second');

    // GET all
    const list = await request(app)
      .get('/api/answers')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].answer).toBe('second');
  });

  it('6️⃣ Orders lifecycle', async () => {
    // place
    const payload = {
      items: [{ product: sampleProduct._id, quantity: 2 }],
      paymentDetails: { doctorFee: 5 }
    };
    let ord = await request(app)
      .post('/api/orders')
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201);
    orderId = ord.body._id;

    // verify total
    const expected = sampleProduct.price * 2 + 5;
    expect(ord.body.totalAmount).toBe(expected);

    // list
    const list1 = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(list1.body.find(o => o._id === orderId)).toBeDefined();

    // fetch single
    await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    // non-admin cannot change status
    await request(app)
      .put(`/api/orders/${orderId}/status`)
      .send({ status: 'completed' })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    // admin updates
    ord = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .send({ status: 'completed' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(ord.body.status).toBe('completed');

    // user deletes own order
    await request(app)
      .delete(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204);

    // confirm gone
    const list2 = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(list2.body.find(o => o._id === orderId)).toBeUndefined();
  });
});
