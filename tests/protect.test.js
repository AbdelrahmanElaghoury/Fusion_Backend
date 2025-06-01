// tests/protect.test.js
jest.setTimeout(20000);

// 1️⃣ Load test-env BEFORE anything else so JWT_SECRET, etc. are set
require('dotenv').config({ path: '.env.test' });

const mongoose              = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request               = require('supertest');

// 2️⃣ Import the app (server.js now exports app directly)
const app = require('../server');

let mongoServer;
let token;

beforeAll(async () => {
  // 3️⃣ Spin up in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri   = mongoServer.getUri();

  // 4️⃣ Override your env vars
  process.env.MONGODB_URI = uri;
  process.env.DB_NAME     = process.env.DB_NAME || 'fusion_test';
  // ensure your test has a JWT_SECRET
  process.env.JWT_SECRET  = process.env.JWT_SECRET || 'testsecret';

  // 5️⃣ Now connect mongoose yourself
  await mongoose.connect(uri, {
    dbName:           process.env.DB_NAME,
    useNewUrlParser:  true,
    useUnifiedTopology: true
  });

  // 6️⃣ Create one user and grab its token
  const res = await request(app)
    .post('/api/auth/signup')
    .send({
      email:     'dave@example.com',
      password:  'Secret123',
      firstName: 'Dave'
    });

  token = res.body.token;
});

afterAll(async () => {
  // 7️⃣ Tear down
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Protected routes', () => {
  it('denies access without token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.statusCode).toBe(401);
  });

  it('allows access with valid token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('dave@example.com');
  });
});
