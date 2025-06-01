// tests/auth.test.js
jest.setTimeout(20000);
require('dotenv').config();

const mongoose              = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request               = require('supertest');
const app                   = require('../app');     // just the app
const User                  = require('../models/userModel');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri   = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.DB_NAME      = 'test';

  // connect mongoose to in-memory
  await mongoose.connect(uri, { dbName: 'test' });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth: signup & login', () => {
  it('should signup a new user', async () => {
    const email = `alice-${Date.now()}@example.com`;
    const res   = await request(app)
      .post('/api/auth/signup')
      .send({ email, password: 'P@ssw0rd!', firstName: 'Alice' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User created');
    expect(res.body).toHaveProperty('userId');

    // verify in DB
    const userInDb = await User.findOne({ email }).lean();
    expect(userInDb).not.toBeNull();
    expect(userInDb.email).toBe(email);
  });

  it('should not login with bad creds', async () => {
    const email = `bob-${Date.now()}@example.com`;

    // signup first
    await request(app)
      .post('/api/auth/signup')
      .send({ email, password: 'Secret1!', firstName: 'Bob' })
      .expect(201);

    // login wrong
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Wrong!' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should login and return a userId', async () => {
    const email = `carol-${Date.now()}@example.com`;

    // signup
    await request(app)
      .post('/api/auth/signup')
      .send({ email, password: 'MyPass123', firstName: 'Carol' })
      .expect(201);

    // login correct
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'MyPass123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logged in!');
    expect(res.body).toHaveProperty('userId');
  });
});
