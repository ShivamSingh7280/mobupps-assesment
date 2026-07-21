jest.mock('../../../src/config/supabaseClient', () => ({ from: jest.fn() }));
jest.mock('../../../src/services/upload.service', () => ({
  destroyImageBestEffort: jest.fn().mockResolvedValue(undefined),
}));

const supabase = require('../../../src/config/supabaseClient');
const { destroyImageBestEffort } = require('../../../src/services/upload.service');
const { createQueryBuilder } = require('../../helpers/mockSupabase');
const productService = require('../../../src/services/product.service');

describe('product.service', () => {
  afterEach(() => jest.clearAllMocks());

  describe('listProducts', () => {
    it('returns items and pagination meta', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: [{ id: 'p1' }], error: null, count: 1 }));

      const result = await productService.listProducts({ page: 1, limit: 12, search: undefined });

      expect(result.items).toHaveLength(1);
      expect(result.meta).toEqual({ page: 1, limit: 12, total: 1, totalPages: 1 });
    });

    it('sanitizes the search term before building the filter', async () => {
      const builder = createQueryBuilder({ data: [], error: null, count: 0 });
      supabase.from.mockReturnValueOnce(builder);

      await productService.listProducts({ page: 1, limit: 12, search: 'a,b(c)d' });

      expect(builder.or).toHaveBeenCalledWith('name.ilike.%abcd%,description.ilike.%abcd%');
    });

    it('neutralizes an adversarial search term attempting to break out of the filter', async () => {
      const builder = createQueryBuilder({ data: [], error: null, count: 0 });
      supabase.from.mockReturnValueOnce(builder);

      await productService.listProducts({ page: 1, limit: 12, search: 'x),or(role.eq.admin' });

      const [callArg] = builder.or.mock.calls[0];
      expect(callArg).not.toContain('),or(');
    });

    it('surfaces a DB error as 500', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: null, error: { message: 'down' }, count: null }));
      await expect(productService.listProducts({ page: 1, limit: 12 })).rejects.toMatchObject({ statusCode: 500 });
    });
  });

  describe('getProductById', () => {
    it('returns the product when found', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: { id: 'p1', name: 'Widget' }, error: null }));
      const product = await productService.getProductById('p1');
      expect(product.name).toBe('Widget');
    });

    it('throws 404 when missing', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));
      await expect(productService.getProductById('missing')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('createProduct', () => {
    it('stamps created_by and returns the inserted row', async () => {
      const builder = createQueryBuilder({ data: { id: 'p1', name: 'Widget', created_by: 'u1' }, error: null });
      supabase.from.mockReturnValueOnce(builder);

      const product = await productService.createProduct({ name: 'Widget', price: 10, stock_quantity: 1 }, 'u1');

      expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({ created_by: 'u1' }));
      expect(product.id).toBe('p1');
    });
  });

  describe('updateProduct', () => {
    it('updates fields without touching Cloudinary when the image is not part of the payload', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: { id: 'p1', name: 'New name' }, error: null }));

      await productService.updateProduct('p1', { name: 'New name' });

      expect(destroyImageBestEffort).not.toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });

    it('destroys the previous image when it is being replaced', async () => {
      supabase.from
        .mockReturnValueOnce(createQueryBuilder({ data: { image_public_id: 'old-id' }, error: null })) // pre-fetch
        .mockReturnValueOnce(createQueryBuilder({ data: { id: 'p1', image_public_id: 'new-id' }, error: null })); // update

      await productService.updateProduct('p1', { image_public_id: 'new-id' });

      expect(destroyImageBestEffort).toHaveBeenCalledWith('old-id');
    });

    it('does not destroy the image if the new public id matches the old one', async () => {
      supabase.from
        .mockReturnValueOnce(createQueryBuilder({ data: { image_public_id: 'same-id' }, error: null }))
        .mockReturnValueOnce(createQueryBuilder({ data: { id: 'p1', image_public_id: 'same-id' }, error: null }));

      await productService.updateProduct('p1', { image_public_id: 'same-id' });

      expect(destroyImageBestEffort).not.toHaveBeenCalled();
    });

    it('throws 404 when the product does not exist', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));
      await expect(productService.updateProduct('missing', { name: 'x' })).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('deleteProduct', () => {
    it('deletes the row and cleans up its image', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: { id: 'p1', image_public_id: 'img1' }, error: null }));
      await productService.deleteProduct('p1');
      expect(destroyImageBestEffort).toHaveBeenCalledWith('img1');
    });

    it('skips Cloudinary cleanup when there was no image', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: { id: 'p1', image_public_id: null }, error: null }));
      await productService.deleteProduct('p1');
      expect(destroyImageBestEffort).not.toHaveBeenCalled();
    });

    it('throws 404 when the product does not exist', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));
      await expect(productService.deleteProduct('missing')).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
