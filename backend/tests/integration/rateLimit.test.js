jest.mock('../../src/config/supabaseClient', () => ({ from: jest.fn() }));

const request = require('supertest');
const app = require('../../src/app');
const supabase = require('../../src/config/supabaseClient');
const { createQueryBuilder } = require('../helpers/mockSupabase');

// The limiter is skipped whenever NODE_ENV === 'test' (see
// rateLimit.middleware.js) so the rest of the suite isn't flaky. Flip it
// off just for this file so we exercise the real, production middleware
// instance instead of a re-implementation of it.
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

describe('login rate limiting', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'production';
  });

  afterAll(() => {
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  });

  afterEach(() => jest.clearAllMocks());

  it('allows up to the configured limit, then rejects further attempts with 429', async () => {
    supabase.from.mockReturnValue(createQueryBuilder({ data: null, error: null }));

    const attempts = [];
    for (let i = 0; i < 5; i += 1) {
      attempts.push(
        await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'nobody@example.com', password: 'whatever1' })
      );
    }

    attempts.forEach((res) => expect(res.status).not.toBe(429));

    const blocked = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever1' });

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      success: false,
      message: 'Too many attempts, please try again shortly.',
    });
  });

  it('does not throw when a forwarded-for header is present (trust proxy is configured)', async () => {
    supabase.from.mockReturnValue(createQueryBuilder({ data: null, error: null }));

    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('X-Forwarded-For', '203.0.113.5')
      .send({ email: 'someone-else@example.com', password: 'whatever1' });

    expect(res.status).not.toBe(500);
  });
});
