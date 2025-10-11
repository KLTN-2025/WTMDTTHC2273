const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerCart = require('../controllers/cart.controller');

router.post('/add-cart', authUser, asyncHandler(controllerCart.addCart));
router.get('/get-cart', authUser, asyncHandler(controllerCart.getCart));

router.delete('/delete-product-cart', authUser, asyncHandler(controllerCart.deleteProductCart));
router.post('/update-info-user-cart', authUser, asyncHandler(controllerCart.updateInfoUserCart));

router.post('/apply-coupon', authUser, asyncHandler(controllerCart.applyCoupon));

module.exports = router;
