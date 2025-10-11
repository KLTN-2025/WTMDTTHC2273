const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

router.post('/create-blog', authAdmin, asyncHandler(require('../controllers/blogs.controller').createBlog));
router.get('/blogs', asyncHandler(require('../controllers/blogs.controller').getAllBlog));
router.get('/blog', asyncHandler(require('../controllers/blogs.controller').getOneBlog));
router.delete('/delete-blog', authAdmin, asyncHandler(require('../controllers/blogs.controller').deleteBlog));

module.exports = router;
