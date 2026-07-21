const supabase = require('../config/supabaseClient');
const ApiError = require('../utils/ApiError');
const { destroyImageBestEffort } = require('./upload.service');

const PRODUCT_FIELDS = 'id, name, description, price, stock_quantity, image_url, image_public_id, created_by, created_at, updated_at';

function buildSearchPattern(rawTerm) {
  const withoutFilterMetachars = rawTerm.replace(/[,()]/g, '');
  const withEscapedWildcards = withoutFilterMetachars.replace(/[\\%_]/g, (match) => `\\${match}`);
  return `%${withEscapedWildcards}%`;
}

async function listProducts({ page, limit, search }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('products').select(PRODUCT_FIELDS, { count: 'exact' });

  if (search) {
    const pattern = buildSearchPattern(search);
    query = query.or(`name.ilike.${pattern},description.ilike.${pattern}`);
  }

  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw ApiError.internal('Failed to fetch products');

  const total = count ?? 0;
  return {
    items: data,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

async function getProductById(id) {
  const { data, error } = await supabase.from('products').select(PRODUCT_FIELDS).eq('id', id).maybeSingle();
  if (error) throw ApiError.internal('Failed to fetch product');
  if (!data) throw ApiError.notFound('Product not found');
  return data;
}

async function createProduct(payload, userId) {
  const { data, error } = await supabase
    .from('products')
    .insert({ ...payload, created_by: userId })
    .select(PRODUCT_FIELDS)
    .single();
  if (error) throw ApiError.internal('Failed to create product');
  return data;
}

async function updateProduct(id, payload) {
  
  let previousImagePublicId = null;
  if (Object.prototype.hasOwnProperty.call(payload, 'image_public_id')) {
    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('image_public_id')
      .eq('id', id)
      .maybeSingle();
    if (fetchError) throw ApiError.internal('Failed to update product');
    if (!existing) throw ApiError.notFound('Product not found');
    previousImagePublicId = existing.image_public_id;
  }

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select(PRODUCT_FIELDS)
    .maybeSingle();
  if (error) throw ApiError.internal('Failed to update product');
  if (!data) throw ApiError.notFound('Product not found');

  if (previousImagePublicId && previousImagePublicId !== payload.image_public_id) {
    await destroyImageBestEffort(previousImagePublicId);
  }

  return data;
}

async function deleteProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .select('id, image_public_id')
    .maybeSingle();
  if (error) throw ApiError.internal('Failed to delete product');
  if (!data) throw ApiError.notFound('Product not found');

  if (data.image_public_id) {
    await destroyImageBestEffort(data.image_public_id);
  }

  return data;
}

module.exports = { listProducts, getProductById, createProduct, updateProduct, deleteProduct };
