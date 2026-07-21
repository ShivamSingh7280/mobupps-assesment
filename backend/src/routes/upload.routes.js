const { Router } = require('express');
const requireAuth = require('../middleware/auth.middleware');
const uploadController = require('../controllers/upload.controller');

const router = Router();

router.use(requireAuth);

router.post('/signature', uploadController.getSignature);

module.exports = router;
