// tests/profile.test.js
const request               = require('supertest');
const mongoose              = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt                   = require('jsonwebtoken');

let app, mongoServer, token, userId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'test' });

  // server.js now exports the express() app directly
  app = require('../server');

  // Signup & login to get a token + userId
  const email = `u${Date.now()}@example.com`;
  await request(app)
    .post('/api/auth/signup')
    .send({ email, password: 'P@ssw0rd', firstName: 'Test' })
    .expect(201);
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'P@ssw0rd' })
    .expect(200);

  token  = login.body.token;
  userId = jwt.decode(token).id;  // string
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('User Profile API', () => {
  it('GET /api/profile → empty profile is created', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // controller returns { user: <ObjectId>, email, firstName, lastName, addresses, paymentMethods }
    expect(res.body).toHaveProperty('userId', userId);
    expect(Array.isArray(res.body.addresses)).toBe(true);
    expect(res.body.addresses).toHaveLength(0);
    expect(Array.isArray(res.body.paymentMethods)).toBe(true);
    expect(res.body.paymentMethods).toHaveLength(0);
  });

  it('PUT /api/profile → bulk update addresses & paymentMethods', async () => {
    const payload = {
      addresses: [{
        label:      'Home',
        line1:      '123 Oak St',
        city:       'Springfield',
        state:      'IL',
        postalCode: '62704',
        country:    'USA'
      }],
      paymentMethods: [{
        cardholderName: 'Test User',
        cardNumber:     '4242',    // just last 4
        expMonth:       12,
        expYear:        2026,
        brand:          'Visa'
      }]
    };
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    expect(res.body).toHaveProperty('userId', userId);
    expect(res.body.addresses).toHaveLength(1);
    expect(res.body.addresses[0]).toMatchObject({ label: 'Home', city: 'Springfield' });
    expect(res.body.paymentMethods).toHaveLength(1);
    expect(res.body.paymentMethods[0]).toMatchObject({ brand: 'Visa', cardholderName: 'Test User' });
  });

  it('POST /api/profile/address → push an address', async () => {
    const addr = {
      label:      'Work',
      line1:      '500 Main St',
      city:       'Chicago',
      state:      'IL',
      postalCode: '60601',
      country:    'USA'
    };
    const res = await request(app)
      .post('/api/profile/address')
      .set('Authorization', `Bearer ${token}`)
      .send(addr)
      .expect(201);

    expect(res.body).toHaveProperty('user', userId);
    expect(res.body.addresses).toHaveLength(2);
    expect(res.body.addresses[1]).toMatchObject({ label: 'Work', city: 'Chicago' });
  });

  it('DELETE /api/profile/address/:index → remove first address', async () => {
    const res = await request(app)
      .delete('/api/profile/address/0')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('user', userId);
    expect(res.body.addresses).toHaveLength(1);
    expect(res.body.addresses[0]).toMatchObject({ label: 'Work' });
  });
});
