const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerPayments = require('../controllers/payments.controller');

router.post('/payments', authUser, asyncHandler(controllerPayments.payment));

router.get('/check-payment-momo', asyncHandler(controllerPayments.checkPaymentMomo));
router.get('/check-payment-vnpay', asyncHandler(controllerPayments.checkPaymentVnpay));

router.get('/get-all-order', authUser, asyncHandler(controllerPayments.filterOrder));

router.get('/get-payment', authUser, asyncHandler(controllerPayments.getHistoryOrder));
router.get('/get-one-payment', authUser, asyncHandler(controllerPayments.getOnePayment));

router.post('/update-status-order', authUser, asyncHandler(controllerPayments.updateStatusOrder));
module.exports = router;
