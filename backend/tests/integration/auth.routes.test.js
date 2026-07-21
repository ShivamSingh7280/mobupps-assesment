jest.mock('../../src/config/supabaseClient', () => ({ from: jest.fn() }));

const request = require('supertest');
const app = require('../../src/app');
const supabase = require('../../src/config/supabaseClient');
const { createQueryBuilder } = require('../helpers/mockSupabase');

describe('Auth routes', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/v1/auth/register', () => {
    it('rejects invalid payloads with 400 and field errors', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'a', email: 'bad', password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('creates an account and sets a refresh cookie', async () => {
      supabase.from
        .mockReturnValueOnce(createQueryBuilder({ data: null, error: null }))
        .mockReturnValueOnce(
          createQueryBuilder({
            data: { id: 'u1', name: 'Test User', email: 'new@example.com', created_at: 'now' },
            error: null,
          })
        )
        .mockReturnValueOnce(createQueryBuilder({ error: null }));

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test User', email: 'new@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.data.accessToken).toEqual(expect.any(String));
      expect(res.body.data.user.email).toBe('new@example.com');
      expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=/);
    });

    it('rejects a duplicate email with 409', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: { id: 'existing' }, error: null }));

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test User', email: 'dup@example.com', password: 'password123' });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('rejects invalid payloads with 400', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'not-an-email' });
      expect(res.status).toBe(400);
    });

    it('rejects wrong credentials with 401', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'whatever1' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('protected auth endpoints', () => {
    it('GET /me rejects requests without a token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('POST /logout rejects requests without a token', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.status).toBe(401);
    });
  });
});
