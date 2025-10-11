const express = require('express');
const router = express.Router();

const controllerCoupon = require('../controllers/coupon.controller');

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

router.post('/create-coupon', asyncHandler(controllerCoupon.createCoupon));
router.get('/coupon', asyncHandler(controllerCoupon.getCoupons));
router.get('/coupons', asyncHandler(controllerCoupon.getAllCoupon));
router.delete('/delete-coupon', asyncHandler(controllerCoupon.deleteCoupon));
router.post('/update-coupon', asyncHandler(controllerCoupon.updateCoupon));

module.exports = router;
