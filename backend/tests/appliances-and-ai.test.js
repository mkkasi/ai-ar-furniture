const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

let mongoServer;
let app;
let User;
let Category;
let Furniture;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGO_URI);

  app = require('../app');
  User = require('../models/User');
  Category = require('../models/Category');
  Furniture = require('../models/Furniture');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Furniture.deleteMany({})]);
});

const registerAndLogin = async () => {
  const email = `user${Date.now()}${Math.random()}@example.com`;
  await request(app).post('/api/auth/register').send({ name: 'Tester', email, password: 'Password123!' });
  const user = await User.findOneAndUpdate({ email }, { isEmailVerified: true }, { new: true });
  const login = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
  return { token: login.body?.data?.accessToken, user };
};

describe('Appliance catalog support (itemType, specifications)', () => {
  it('creates a TV appliance with specifications and US voltage/energy fields', async () => {
    const category = await Category.create({ name: 'Televisions', productType: 'appliance' });

    const tv = await Furniture.create({
      name: 'Test 55" Smart TV',
      description: 'A test television.',
      itemType: 'appliance',
      category: category._id,
      dimensions: { widthCm: 123, heightCm: 71, depthCm: 8 },
      specifications: [
        { key: 'Screen Size', value: '55 inch' },
        { key: 'Resolution', value: '4K UHD' },
      ],
      voltage: '120V',
      energyRating: 'Energy Star Certified',
      roomTypes: ['living_room'],
    });

    expect(tv.itemType).toBe('appliance');
    expect(tv.specifications).toHaveLength(2);
    expect(tv.voltage).toBe('120V');
  });

  it('defaults itemType to furniture when not specified (backward compatible)', async () => {
    const category = await Category.create({ name: 'Living Room' });
    const sofa = await Furniture.create({
      name: 'Test Sofa',
      description: 'A test sofa.',
      category: category._id,
      dimensions: { widthCm: 200, heightCm: 80, depthCm: 90 },
      roomTypes: ['living_room'],
    });
    expect(sofa.itemType).toBe('furniture');
    expect(sofa.voltage).toBeNull();
  });

  it('rejects an invalid voltage value', async () => {
    const category = await Category.create({ name: 'Air Conditioners', productType: 'appliance' });
    await expect(
      Furniture.create({
        name: 'Bad AC',
        description: 'Invalid voltage test.',
        itemType: 'appliance',
        category: category._id,
        dimensions: { widthCm: 50, heightCm: 30, depthCm: 20 },
        voltage: '999V',
      })
    ).rejects.toThrow();
  });

  it('filters the furniture list endpoint by itemType', async () => {
    const furnitureCategory = await Category.create({ name: 'Bedroom' });
    const applianceCategory = await Category.create({ name: 'Televisions', productType: 'appliance' });

    await Furniture.create([
      {
        name: 'Bed Frame',
        description: 'desc',
        category: furnitureCategory._id,
        dimensions: { widthCm: 160, heightCm: 100, depthCm: 200 },
      },
      {
        name: 'Smart TV',
        description: 'desc',
        itemType: 'appliance',
        category: applianceCategory._id,
        dimensions: { widthCm: 120, heightCm: 70, depthCm: 8 },
      },
    ]);

    const res = await request(app).get('/api/furniture').query({ itemType: 'appliance' });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Smart TV');
  });
});

describe('Category productType grouping', () => {
  it('filters categories by productType', async () => {
    await Category.create({ name: 'Living Room', productType: 'furniture' });
    await Category.create({ name: 'Air Conditioners', productType: 'appliance' });

    const res = await request(app).get('/api/categories').query({ productType: 'appliance' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Air Conditioners');
  });
});

describe('AI Interior Design endpoint', () => {
  it('rejects a request with no room photo attached', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app)
      .post('/api/ai/interior-design')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/ai/interior-design');
    expect(res.status).toBe(401);
  });

  // Note: a full success-path test (uploading a real image and asserting on
  // recommendedFurniture/recommendedAppliances) requires Cloudinary and
  // optionally GEMINI_API_KEY to be configured, so it isn't exercised in
  // this offline suite. The 400/401 guard-clause tests above, combined
  // with the itemType/specifications model tests, cover the parts of this
  // feature that don't require live external services.
});

describe('AI Visual Search endpoint', () => {
  it('rejects a request with no photo attached', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app).post('/api/ai/visual-search').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/ai/visual-search');
    expect(res.status).toBe(401);
  });

  // As with /interior-design, the full success path needs Cloudinary +
  // GEMINI_API_KEY, so only the guard clauses are covered offline here.
});

describe('AI Shopping Assistant chat endpoints', () => {
  it('rejects an empty message', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app).post('/api/ai/chat').set('Authorization', `Bearer ${token}`).send({ message: '   ' });
    expect(res.status).toBe(400);
  });

  it('requires authentication on all three chat routes', async () => {
    const post = await request(app).post('/api/ai/chat').send({ message: 'hi' });
    const get = await request(app).get('/api/ai/chat/history');
    const del = await request(app).delete('/api/ai/chat/history');
    expect(post.status).toBe(401);
    expect(get.status).toBe(401);
    expect(del.status).toBe(401);
  });

  it('replies (with the AI-unconfigured fallback message when no GEMINI_API_KEY is set) and persists history', async () => {
    const { token } = await registerAndLogin();

    const chatRes = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'What sofa would suit a small apartment?' });
    expect(chatRes.status).toBe(200);
    expect(typeof chatRes.body.data.reply).toBe('string');
    expect(chatRes.body.data.reply.length).toBeGreaterThan(0);

    const historyRes = await request(app).get('/api/ai/chat/history').set('Authorization', `Bearer ${token}`);
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.data.length).toBe(2); // user turn + assistant turn
    expect(historyRes.body.data[0].role).toBe('user');
    expect(historyRes.body.data[1].role).toBe('assistant');

    const clearRes = await request(app).delete('/api/ai/chat/history').set('Authorization', `Bearer ${token}`);
    expect(clearRes.status).toBe(200);

    const afterClear = await request(app).get('/api/ai/chat/history').set('Authorization', `Bearer ${token}`);
    expect(afterClear.body.data.length).toBe(0);
  });
});
