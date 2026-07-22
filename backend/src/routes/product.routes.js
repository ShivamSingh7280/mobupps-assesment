const { Router } = require('express');
const requireAuth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
} = require('../validators/product.validator');
const productController = require('../controllers/product.controller');

const router = Router();

router.use(requireAuth);

router.get('/categories', productController.categories);
router.get('/', validate(listProductsQuerySchema, 'query'), productController.list);
router.get('/:id', validate(productIdParamSchema, 'params'), productController.getOne);
router.post('/', validate(createProductSchema), productController.create);
router.put(
  '/:id',
  validate(productIdParamSchema, 'params'),
  validate(updateProductSchema),
  productController.update
);
router.delete('/:id', validate(productIdParamSchema, 'params'), productController.remove);

module.exports = router;
