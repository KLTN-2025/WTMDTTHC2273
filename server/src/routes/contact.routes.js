const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerContact = require('../controllers/contact.controller');

router.post('/create-contact', authUser, asyncHandler(controllerContact.createContact));
router.get('/get-contact', authAdmin, asyncHandler(controllerContact.getContact));
router.post('/reply-contact', authAdmin, asyncHandler(controllerContact.replyContact));

module.exports = router;
