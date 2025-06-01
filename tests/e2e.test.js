// tests/e2e.test.js
/**
 * End-to-End smoke tests against a live server.
 * Run your server separately (e.g. `npm start`),
 * then `npm run test:e2e`.
 */

const axios          = require('axios');
const { faker }      = require('@faker-js/faker');

const baseURL = process.env.BASE_URL || 'http://localhost:5001';
const client  = axios.create({ baseURL });

describe('🚀 E2E API Smoke Test', () => {
  let user, userToken;
  let product, concernFilter;
  let answerQuestions;
  let order;

  beforeAll(async () => {
    // ensure server is up
    await expect(client.get('/api/products')).resolves.toHaveProperty('status', 200);
  });

  it('1️⃣ Signup + Login', async () => {
    const email    = `e2e+${Date.now()}@example.com`;
    const password = 'Test1234!';
    // signup
    const signup = await client.post('/api/auth/signup', {
      email, password, firstName: 'E2E', lastName: 'Tester'
    });
    expect(signup.status).toBe(201);
    userToken = signup.data.token;
    user      = { id: signup.data.userId, email };

    // login
    const login = await client.post('/api/auth/login', { email, password });
    expect(login.status).toBe(200);
    expect(login.data).toHaveProperty('token');
    userToken = login.data.token;
  });

  it('2️⃣ Profile CRUD', async () => {
    const headers = { Authorization: `Bearer ${userToken}` };

    // GET (auto-create)
    const me = await client.get('/api/profile', { headers });
    expect(me.status).toBe(200);
    expect(me.data).toMatchObject({ userId: user.id, email: user.email });

    // PUT update
    const upd = await client.put('/api/profile', {
      addresses: [{
        label:      'Home',
        line1:      '123 Main St',
        city:       'Townsville',
        state:      'TS',
        postalCode: '11111',
        country:    'US'
      }],
      paymentMethods: [{
        cardholderName: 'E2E Tester',
        cardNumber:     '4242',
        expMonth:       12,
        expYear:        2030,
        brand:          'Visa'
      }]
    }, { headers });
    expect(upd.status).toBe(200);
    expect(upd.data.addresses).toHaveLength(1);
    expect(upd.data.paymentMethods[0]).toMatchObject({ brand: 'Visa' });
  });

  it('3️⃣ Questions & Answers', async () => {
    const headers = { Authorization: `Bearer ${userToken}` };

    // fetch all questions
    const qs = await client.get('/api/questions');
    expect(qs.status).toBe(200);
    answerQuestions = qs.data.slice(0, 2);

    // bulk upsert answers
    const payload = answerQuestions.map(q => ({
      questionId: q._id,
      answer:     faker.lorem.words(3)
    }));
    const ansRes = await client.post('/api/answers', payload, { headers });
    expect(ansRes.status).toBe(201);
    expect(ansRes.data).toHaveLength(2);

    // GET back
    const myAns = await client.get('/api/answers', { headers });
    expect(myAns.status).toBe(200);
    expect(myAns.data.length).toBeGreaterThanOrEqual(2);
  });

  it('4️⃣ Cart Flow', async () => {
    const headers = { Authorization: `Bearer ${userToken}` };

    // grab a product with concerns
    const prods = await client.get('/api/products');
    product       = prods.data.find(p => Array.isArray(p.concerns) && p.concerns.length);
    concernFilter = product.concerns[0];

    // empty cart
    const empty = await client.get('/api/cart', { headers });
    expect(empty.data.items).toHaveLength(0);

    // add item
    console.log("product._id = ", product._id);
    console.log("Type of product._id = ", typeof(product._id));
    const added = await client.post('/api/cart', {
      productId: product._id,
      quantity:  2
    }, { headers });
    expect(added.status).toBe(201);
    expect(added.data.items[0]).toMatchObject({
      product:  product._id,
      quantity: 2
    });

    // update quantity
    const upd = await client.put(`/api/cart/${product._id}`, {
      quantity: 5
    }, { headers });
    expect(upd.data.items[0].quantity).toBe(5);

    // remove single item
    const rem = await client.delete(`/api/cart/${product._id}`, { headers });
    expect(rem.data.items).toHaveLength(0);

    // clear idempotent
    await client.delete('/api/cart', { headers });
  });

  it('5️⃣ Filter by productKey, answer one, and persist', async () => {
    const headers = { Authorization: `Bearer ${userToken}` };
    const pk      = product.name; // must match rxQuestions key

    // (a) Fetch questions filtered by productKey
    const qRes = await client.get('/api/questions', {
      params: { productKey: pk }
    });
    expect(qRes.status).toBe(200);
    expect(Array.isArray(qRes.data)).toBe(true);
    expect(qRes.data.length).toBeGreaterThan(0);

    // pick first question
    const question = qRes.data[0];
    expect(question).toHaveProperty('_id');

    // (b) Submit an answer
    const answerPayload = {
      questionId: question._id,
      answer:     `E2E answer for ${pk}`
    };
    const ansRes = await client.post('/api/answers', answerPayload, { headers });
    expect(ansRes.status).toBe(201);
    expect(ansRes.data).toHaveProperty('question', question._id);
    expect(ansRes.data).toHaveProperty('answer', answerPayload.answer);

    // (c) Fetch back answers
    const getAns = await client.get('/api/answers', { headers });
    expect(getAns.status).toBe(200);
    expect(getAns.data.some(a => a.question === question._id)).toBe(true);
  });

  it('6️⃣ Product Filtering', async () => {
    const filtered = await client.get('/api/products', {
      params: { concern: concernFilter }
    });
    expect(filtered.status).toBe(200);
    filtered.data.forEach(p => {
      expect(p.concerns).toContain(concernFilter);
    });
  });

  it('7️⃣ Orders Lifecycle', async () => {
    const headers = { Authorization: `Bearer ${userToken}` };

    // place an order
    const ordRes = await client.post('/api/orders', {
      items: [{ product: product._id, quantity: 3 }],
      paymentDetails: { doctorFee: 7 }
    }, { headers });
    expect(ordRes.status).toBe(201);
    order = ordRes.data;

    // list orders
    const list = await client.get('/api/orders', { headers });
    expect(list.data.some(o => o._id === order._id)).toBe(true);

    // get single
    const single = await client.get(`/api/orders/${order._id}`, { headers });
    expect(single.data).toHaveProperty('_id', order._id);

    // try status update as normal user
    await expect(
      client.put(`/api/orders/${order._id}/status`, { status: 'completed' }, { headers })
    ).rejects.toMatchObject({ response: { status: 403 } });

    // cancel order
    await client.delete(`/api/orders/${order._id}`, { headers })
      .then(r => expect(r.status).toBe(204));

    // verify gone
    const postCancel = await client.get('/api/orders', { headers });
    expect(postCancel.data.find(o => o._id === order._id)).toBeUndefined();
  });
});
