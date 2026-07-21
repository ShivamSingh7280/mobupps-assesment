const { z } = require('zod');

const createProductSchema = z.object({
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

const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().max(150).optional(),
});

const productIdParamSchema = z.object({
  id: z.string().uuid('Invalid product id'),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
};
