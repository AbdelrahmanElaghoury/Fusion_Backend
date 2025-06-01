// tests/questions.test.js
const mongoose              = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request               = require('supertest');
const qs                    = require('../data/questions');
const Question              = require('../models/questionModel');
let app, mongoServer;

jest.setTimeout(20000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri   = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  await mongoose.connect(uri, { dbName: 'test' });
  app = require('../app');

  // seed questions
  const docs = [];
  qs.personalInfoQuestions.forEach(qs =>
    docs.push({
      questionId:   qs.id,
      questionText: qs.question,
      type:         qs.type,
      options:      qs.options || [],
      category:     'personal',
      productKey:   null
    })
  );
  qs.medicalHistoryQuestions.forEach(qs =>
    docs.push({
      questionId:   qs.id,
      questionText: qs.question,
      type:         qs.type,
      options:      qs.options || [],
      category:     'medical',
      productKey:   null
    })
  );
  Object.entries(qs.rxQuestions).forEach(([pk, arr]) =>
    arr.forEach(qs =>
      docs.push({
        questionId:   `${pk}::${qs.id}`,
        questionText: qs.question,
        type:         qs.type,
        options:      qs.options || [],
        category:     'product',
        productKey:   pk
      })
    )
  );
  await Question.deleteMany({});
  await Question.insertMany(docs);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Questions API', () => {
  it('GET /api/questions → all', async () => {
    const res = await request(app).get('/api/questions');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/questions?category=personal', async () => {
    const res = await request(app)
      .get('/api/questions')
      .query({ category: 'personal' });
    expect(res.status).toBe(200);
    expect(res.body.every(qs => qs.category === 'personal')).toBe(true);
  });

  it('GET /api/questions?productKey=Topical Cream HQ8', async () => {
    const res = await request(app)
      .get('/api/questions')
      .query({ productKey: 'Topical Cream HQ8' });
    expect(res.status).toBe(200);
    expect(res.body.every(qs => qs.productKey === 'Topical Cream HQ8')).toBe(true);
  });

  it('GET /api/questions/:id', async () => {
    const one = await Question.findOne();
    const res = await request(app).get(`/api/questions/${one._id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('questionId', one.questionId);
  });

  it('404 for missing question', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res    = await request(app).get(`/api/questions/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Question not found');
  });
});
