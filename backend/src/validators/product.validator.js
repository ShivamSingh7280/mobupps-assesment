const { z } = require('zod');

const PRODUCT_CATEGORIES = ['Pharma', 'Food', 'Defence', 'Fashion', 'Electronics', 'Furniture'];

const createProductSchema = z.object({
  category: z.enum(PRODUCT_CATEGORIES, { errorMap: () => ({ message: 'Please select a valid category' }) }),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  description: z.string().trim().max(2000).optional().nullable(),
  price: z.coerce.number().nonnegative('Price must be 0 or greater'),
  stock_quantity: z.coerce.number().int().nonnegative('Stock must be 0 or greater').default(0),
  image_url: z.string().url('Invalid image URL').optional().nullable(),
  image_public_id: z.string().optional().nullable(),
});

const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

const STOCK_STATUSES = ['in_stock', 'low_stock', 'out_of_stock'];

const listProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    search: z.string().trim().max(150).optional(),
    category: z
      .string()
      .trim()
      .min(1)
      .transform((value) => value.split(',').map((c) => c.trim()).filter(Boolean))
      .refine((categories) => categories.every((c) => PRODUCT_CATEGORIES.includes(c)), {
        message: 'Invalid category',
      })
      .optional(),
    stockStatus: z.enum(STOCK_STATUSES).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
  })
  .refine((data) => data.minPrice === undefined || data.maxPrice === undefined || data.minPrice <= data.maxPrice, {
    message: 'minPrice must be less than or equal to maxPrice',
    path: ['minPrice'],
  });

const productIdParamSchema = z.object({
  id: z.string().uuid('Invalid product id'),
});

module.exports = {
  PRODUCT_CATEGORIES,
  STOCK_STATUSES,
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
};
