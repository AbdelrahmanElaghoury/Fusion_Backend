// tests/perf/perf.js
const autocannon = require('autocannon');
const axios      = require('axios');

const BASE_URL = 'http://localhost:5001';
const CRED = {
  email:     'loadtest@example.com',
  password:  'TestPass123',
  firstName: 'Load'
};

// Ensure the user exists (signup if needed)
async function ensureUser() {
  try {
    await axios.post(`${BASE_URL}/api/auth/signup`, CRED);
    console.log('✅ Load-test user created');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('ℹ️ Load-test user already exists');
    } else {
      console.error('❌ Error creating load-test user:', err.message);
      process.exit(1);
    }
  }
}

// POST /api/auth/login bombardment
async function runLoginBombardment() {
  return new Promise((resolve, reject) => {
    autocannon({
      url: `${BASE_URL}/api/auth/login`,
      connections: 50,
      duration:    10,
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ email: CRED.email, password: CRED.password })
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

// Generic GET bombardment for any path
async function runGetBombardment(path) {
  return new Promise((resolve, reject) => {
    autocannon({
      url: `${BASE_URL}${path}`,
      connections: 50,
      duration:    10
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

(async () => {
  // 1. Prepare user
  await ensureUser();

  // 2. Login load test
  console.log('🚀 Starting login load test…');
  try {
    const loginStats = await runLoginBombardment();
    console.log(autocannon.printResult(loginStats));
  } catch (err) {
    console.error('⚠️ Login load test failed:', err);
  }

  // 3. Products: full list
  console.log('🚀 Starting products list load test (GET /api/products)…');
  try {
    const allStats = await runGetBombardment('/api/products');
    console.log(autocannon.printResult(allStats));
  } catch (err) {
    console.error('⚠️ Products list load test failed:', err);
  }

  // 4. Products: filtered by concern
  console.log('🚀 Starting products filter load test (GET /api/products?concern=Acne)…');
  try {
    const filtStats = await runGetBombardment('/api/products?concern=Acne');
    console.log(autocannon.printResult(filtStats));
  } catch (err) {
    console.error('⚠️ Products filter load test failed:', err);
  }

  process.exit(0);
})();
