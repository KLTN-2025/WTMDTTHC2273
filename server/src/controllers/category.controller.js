const Category = require('../models/category.model');
const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

class CategoryController {
    async createCategory(req, res) {
        const { categoryName, description } = req.body;

        if (!categoryName) {
            throw new BadRequestError('Vui lòng nhập tên danh mục');
        }

        const newCategory = await Category.create({ categoryName, description });

        new OK({
            message: 'Tạo danh mục thành công',
            metadata: newCategory,
        }).send(res);
    }

    async getAllCategory(req, res) {
        const categories = await Category.find();

        new OK({
            message: 'Lấy danh sách danh mục',
            metadata: categories,
        }).send(res);
    }

    async getOneCategory(req, res) {
        const { id } = req.query;
        const category = await Category.findById(id);

        if (!category) {
            throw new BadRequestError('Không tìm thấy danh mục');
        }

        new OK({
            message: 'Lấy thông tin danh mục',
            metadata: category,
        }).send(res);
    }

    async deleteCategory(req, res) {
        const { id } = req.query;
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            throw new BadRequestError('Không tìm thấy danh mục');
        }

        new OK({
            message: 'Xoá danh mục thành công',
            metadata: category,
        }).send(res);
    }
}

module.exports = new CategoryController();
