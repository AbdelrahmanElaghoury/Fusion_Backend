// tests/answers.test.js
const mongoose              = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request               = require('supertest');
const qs                    = require('../data/questions');
const Question              = require('../models/questionModel');
const Answer                = require('../models/answerModel');
let app, mongoServer, token, questionId;

jest.setTimeout(20000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri   = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  await mongoose.connect(uri, { dbName: 'test' });
  app = require('../app');

  // seed one question
  await Question.deleteMany({});
  const q = await Question.create({
    questionId:   'ageConsent',
    questionText: 'Are you over 18?',
    type:         'radio',
    options:      ['Yes','No'],
    category:     'personal',
    productKey:   null
  });
  questionId = q._id;

  // create user + get token
  const signup = await request(app)
    .post('/api/auth/signup')
    .send({ email:'u1@example.com', password:'P@ssword1', firstName:'U1' });
  token = signup.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Answers API', () => {
  it('401 if missing token on POST', async () => {
    const res = await request(app)
      .post('/api/answers')
      .send({ questionId, answer: 'Yes, I am over 18' });
    expect(res.status).toBe(401);
  });

  it('POST /api/answers creates answer', async () => {
    const res = await request(app)
      .post('/api/answers')
      .set('Authorization', `Bearer ${token}`)
      .send({ questionId, answer: 'Yes, I am over 18' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('answer', 'Yes, I am over 18');
  });

  it('GET /api/answers returns only my answers', async () => {
    // create a second answer
    await request(app)
      .post('/api/answers')
      .set('Authorization', `Bearer ${token}`)
      .send({ questionId, answer: 'Yes' });

    const res = await request(app)
      .get('/api/answers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.every(a => a.user === res.body[0].user)).toBe(true);
  });
});
