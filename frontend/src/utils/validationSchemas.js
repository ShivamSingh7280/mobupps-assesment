import { z } from 'zod';

export const PRODUCT_CATEGORIES = ['Pharma', 'Food', 'Defence', 'Fashion', 'Electronics', 'Furniture'];

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[0-9]/, "Must contain number"),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const productSchema = z.object({
  category: z.enum(PRODUCT_CATEGORIES, { errorMap: () => ({ message: 'Please select a category' }) }),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  price: z.coerce.number({ invalid_type_error: 'Price is required' }).nonnegative('Price must be 0 or greater'),
  stock_quantity: z.coerce
    .number({ invalid_type_error: 'Stock is required' })
    .int('Stock must be a whole number')
    .nonnegative('Stock must be 0 or greater'),
});
