const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const list = asyncHandler(async (req, res) => {
  const { items, meta } = await productService.listProducts(req.query);
  sendSuccess(res, { data: items, meta });
});

const getOne = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  sendSuccess(res, { data: product });
});

const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.userId);
  sendSuccess(res, { statusCode: 201, data: product });
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  sendSuccess(res, { data: product });
});

const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  sendSuccess(res, { data: null, message: 'Product deleted' });
});

module.exports = { list, getOne, create, update, remove };
