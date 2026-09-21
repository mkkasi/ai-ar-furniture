const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

let mongoServer;
let app;
let User;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGO_URI);

  // Require after env vars/connection are set up
  app = require('../app');
  User = require('../models/User');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Auth API', () => {
  const validUser = {
    name: 'Test User',
    email: 'test.user@example.com',
    password: 'SecurePass123',
  };

  test('POST /api/auth/register creates a user and returns 201', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(validUser.email);

    const stored = await User.findOne({ email: validUser.email });
    expect(stored).not.toBeNull();
    expect(stored.password).not.toBe(validUser.password); // must be hashed
  });

  test('POST /api/auth/register rejects duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/register rejects short password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'short' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login rejects wrong password with 401', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login succeeds and returns tokens for a verified flow', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    // Manually verify email to simulate a completed OTP flow
    await User.updateOne({ email: validUser.email }, { isEmailVerified: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test('GET /api/auth/profile requires authentication', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });
});
