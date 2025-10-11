const modelBlogs = require('../models/blogs.model');

const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');
class controllerBlogs {
    async createBlog(req, res) {
        const { title, content, image } = req.body;
        if (!title || !content || !image) {
            throw new BadRequestError('Vui lòng nhập đày đủ thống tin');
        }
        const newBlog = await modelBlogs.create({ title, content, image });
        await newBlog.save();
        new OK({ message: 'Tạo bài viết thành công', metadata: newBlog }).send(res);
    }

    async getAllBlog(req, res) {
        const blogs = await modelBlogs.find();
        new OK({ message: 'Lấy danh sách bài viết', metadata: blogs }).send(res);
    }

    async getOneBlog(req, res) {
        const { id } = req.query;
        const blog = await modelBlogs.findById(id);
        if (!blog) {
            throw new BadRequestError('Không tìm thấy bài viết');
        }
        new OK({ message: 'Lấy thống tin bài viết', metadata: blog }).send(res);
    }

    async deleteBlog(req, res) {
        const { id } = req.query;
        const blog = await modelBlogs.findByIdAndDelete(id);
        if (!blog) {
            throw new BadRequestError('Không tìm thấy bài viết');
        }
        new OK({ message: 'Xoá bài viết thành công', metadata: blog }).send(res);
    }
}

module.exports = new controllerBlogs();
