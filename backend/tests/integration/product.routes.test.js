jest.mock('../../src/config/supabaseClient', () => ({ from: jest.fn() }));
jest.mock('../../src/services/upload.service', () => ({
  destroyImageBestEffort: jest.fn().mockResolvedValue(undefined),
  generateUploadSignature: jest.fn(),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const supabase = require('../../src/config/supabaseClient');
const { createQueryBuilder } = require('../helpers/mockSupabase');

const USER_ID = '11111111-1111-1111-1111-111111111111';
const PRODUCT_ID = '22222222-2222-2222-2222-222222222222';

function authHeader() {
  const token = jwt.sign({ sub: USER_ID }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  return `Bearer ${token}`;
}

describe('Product routes', () => {
  afterEach(() => jest.clearAllMocks());

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(401);
  });

  it('rejects an expired/invalid token', async () => {
    const badToken = jwt.sign({ sub: USER_ID }, 'wrong-secret', { expiresIn: '15m' });
    const res = await request(app).get('/api/v1/products').set('Authorization', `Bearer ${badToken}`);
    expect(res.status).toBe(401);
  });

  it('lists products with pagination meta', async () => {
    supabase.from.mockReturnValueOnce(
      createQueryBuilder({ data: [{ id: PRODUCT_ID, name: 'Widget' }], error: null, count: 1 })
    );

    const res = await request(app).get('/api/v1/products?page=1&limit=12').set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toEqual({ page: 1, limit: 12, total: 1, totalPages: 1 });
  });

  it('rejects a limit above the allowed maximum', async () => {
    const res = await request(app).get('/api/v1/products?limit=999').set('Authorization', authHeader());
    expect(res.status).toBe(400);
  });

  it('lists products filtered by category, stock status, and price range', async () => {
    const builder = createQueryBuilder({ data: [{ id: PRODUCT_ID, name: 'Widget' }], error: null, count: 1 });
    supabase.from.mockReturnValueOnce(builder);

    const res = await request(app)
      .get('/api/v1/products?category=Food,Fashion&stockStatus=low_stock&minPrice=10&maxPrice=50')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(builder.in).toHaveBeenCalledWith('category', ['Food', 'Fashion']);
    expect(builder.gte).toHaveBeenCalledWith('stock_quantity', 1);
    expect(builder.lte).toHaveBeenCalledWith('stock_quantity', 5);
  });

  it('rejects an invalid category filter', async () => {
    const res = await request(app).get('/api/v1/products?category=NotACategory').set('Authorization', authHeader());
    expect(res.status).toBe(400);
  });

  it('rejects an invalid stock status filter', async () => {
    const res = await request(app).get('/api/v1/products?stockStatus=bogus').set('Authorization', authHeader());
    expect(res.status).toBe(400);
  });

  it('rejects minPrice greater than maxPrice', async () => {
    const res = await request(app)
      .get('/api/v1/products?minPrice=100&maxPrice=10')
      .set('Authorization', authHeader());
    expect(res.status).toBe(400);
  });

  it('rejects an invalid product id', async () => {
    const res = await request(app).get('/api/v1/products/not-a-uuid').set('Authorization', authHeader());
    expect(res.status).toBe(400);
  });

  it('rejects an invalid create payload', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', authHeader())
      .send({ name: 'a', price: -5 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'price' }),
      ])
    );
  });

  it('creates a product', async () => {
    supabase.from.mockReturnValueOnce(
      createQueryBuilder({
        data: { id: PRODUCT_ID, name: 'Widget', category: 'Electronics', price: 10, stock_quantity: 5 },
        error: null,
      })
    );

    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', authHeader())
      .send({ name: 'Widget', category: 'Electronics', price: 10, stock_quantity: 5 });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Widget');
  });

  it('rejects a create payload missing category', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', authHeader())
      .send({ name: 'Widget', price: 10, stock_quantity: 5 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'category' })])
    );
  });

  it('rejects a create payload with an invalid category', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', authHeader())
      .send({ name: 'Widget', category: 'Toys', price: 10, stock_quantity: 5 });

    expect(res.status).toBe(400);
  });

  it('lists the predefined product categories', async () => {
    const res = await request(app).get('/api/v1/products/categories').set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(['Pharma', 'Food', 'Defence', 'Fashion', 'Electronics', 'Furniture']);
  });

  it('rejects an update with no fields', async () => {
    const res = await request(app)
      .put(`/api/v1/products/${PRODUCT_ID}`)
      .set('Authorization', authHeader())
      .send({});

    expect(res.status).toBe(400);
  });

  it('updates a product', async () => {
    supabase.from.mockReturnValueOnce(
      createQueryBuilder({ data: { id: PRODUCT_ID, name: 'Updated name' }, error: null })
    );

    const res = await request(app)
      .put(`/api/v1/products/${PRODUCT_ID}`)
      .set('Authorization', authHeader())
      .send({ name: 'Updated name' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated name');
  });

  it('deletes a product', async () => {
    supabase.from.mockReturnValueOnce(
      createQueryBuilder({ data: { id: PRODUCT_ID, image_public_id: null }, error: null })
    );

    const res = await request(app).delete(`/api/v1/products/${PRODUCT_ID}`).set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Product deleted');
  });

  it('returns 404 when deleting a nonexistent product', async () => {
    supabase.from.mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));
    const res = await request(app).delete(`/api/v1/products/${PRODUCT_ID}`).set('Authorization', authHeader());
    expect(res.status).toBe(404);
  });
});
