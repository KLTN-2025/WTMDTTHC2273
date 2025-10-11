const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerPreviewProduct = require('../controllers/previewProduct.controller');

router.post('/create-preview-product', authUser, asyncHandler(controllerPreviewProduct.createPreviewProduct));
router.get('/get-preview-product', authUser, asyncHandler(controllerPreviewProduct.getPreviewProduct));

module.exports = router;
