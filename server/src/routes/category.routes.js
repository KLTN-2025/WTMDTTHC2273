const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin } = require('../auth/checkAuth');
const CategoryController = require('../controllers/category.controller');

// Create category
router.post('/create-category', authAdmin, asyncHandler(CategoryController.createCategory));

// Get all categories
router.get('/categories', asyncHandler(CategoryController.getAllCategory));

// Get one category
router.get('/category', asyncHandler(CategoryController.getOneCategory));

// Delete category
router.delete('/delete-category', authAdmin, asyncHandler(CategoryController.deleteCategory));

module.exports = router;
