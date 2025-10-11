const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerUsers = require('../controllers/users.controller');

router.post('/register', asyncHandler(controllerUsers.register));
router.post('/login', asyncHandler(controllerUsers.login));
router.post('/login-google', asyncHandler(controllerUsers.loginGoogle));
router.get('/auth', authUser, asyncHandler(controllerUsers.authUser));
router.get('/logout', authUser, asyncHandler(controllerUsers.logout));
router.get('/refresh-token', asyncHandler(controllerUsers.refreshToken));
router.post('/change-password', authUser, asyncHandler(controllerUsers.changePassword));
router.post('/send-mail-forgot-password', asyncHandler(controllerUsers.sendMailForgotPassword));
router.post('/reset-password', asyncHandler(controllerUsers.verifyOtp));

router.get('/get-admin-stats', authAdmin, asyncHandler(controllerUsers.getAdminStats));
router.get('/get-all-users', authAdmin, asyncHandler(controllerUsers.getAllUser));

router.post('/edit-user', authUser, asyncHandler(controllerUsers.editUser));

router.post('/edit-role-user', authAdmin, asyncHandler(controllerUsers.editRoleUser));

router.get('/get-statistics', authAdmin, asyncHandler(controllerUsers.getStatistics));

router.get('/admin', authAdmin, (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'ok',
    });
});

module.exports = router;
