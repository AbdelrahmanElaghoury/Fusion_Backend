// data/seedQuestions.mjs
import 'dotenv/config';      // loads .env(.test/.production) automatically
import mongoose from 'mongoose';
import Question from '../models/questionModel.js';  // make sure to include the .js extension
import {
  personalInfoQuestions,
  medicalHistoryQuestions,
  rxQuestions
} from './questions.js';

async function seedQuestions() {
  // 1) Connect
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME || 'fusion_ecommerce_store',
    useNewUrlParser:    true,
    useUnifiedTopology: true
  });
  console.log('✅ Connected to MongoDB for question seeding');

  // 2) Build flat list of all question docs
  const docs = [];

  personalInfoQuestions.forEach(q =>
    docs.push({
      questionId:   q.id,
      questionText: q.question,
      type:         q.type,
      options:      q.options || [],
      category:     'personal',
      productKey:   null
    })
  );

  medicalHistoryQuestions.forEach(q =>
    docs.push({
      questionId:   q.id,
      questionText: q.question,
      type:         q.type,
      options:      q.options || [],
      category:     'medical',
      productKey:   null
    })
  );

  Object.entries(rxQuestions).forEach(([productKey, questions]) => {
    questions.forEach(q =>
      docs.push({
        questionId:   `${productKey}::${q.id}`,
        questionText: q.question,
        type:         q.type,
        options:      q.options || [],
        category:     'product',
        productKey
      })
    );
  });

  // 3) Clear & insert
  await Question.deleteMany({});
  console.log('🗑  Cleared existing questions');
  await Question.insertMany(docs);
  console.log(`✅ Seeded ${docs.length} questions`);

  // 4) Tear down
  await mongoose.disconnect();
  console.log('👋 Disconnected, done.');
}

seedQuestions().catch(err => {
  console.error(err);
  process.exit(1);
});
