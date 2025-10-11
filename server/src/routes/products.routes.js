const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const controllerProducts = require('../controllers/products.controller');

router.post('/upload-image', upload.array('images'), asyncHandler(controllerProducts.uploadImage));
router.get('/products', asyncHandler(controllerProducts.getProduct));
router.get('/product', asyncHandler(controllerProducts.getOneProduct));
router.get('/filter-products', asyncHandler(controllerProducts.filterProducts));
router.get('/get-all-products', asyncHandler(controllerProducts.getAllProducts));
router.post('/edit-product', asyncHandler(controllerProducts.editProduct));

router.post('/create-product', authAdmin, upload.array('images'), asyncHandler(controllerProducts.createProduct));
router.delete('/delete-product', authAdmin, asyncHandler(controllerProducts.deleteProduct));
router.get('/search-product', asyncHandler(controllerProducts.searchProduct));

router.post('/delete-image', authAdmin, asyncHandler(controllerProducts.deleteImage));
router.get('/get-all-product-admin', authAdmin, asyncHandler(controllerProducts.getAllProductAdmin));

module.exports = router;
