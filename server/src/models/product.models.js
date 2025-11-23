const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        categoryId: { type: String, required: true },
        name: { type: String, required: true }, // Tên sản phẩm
        price: { type: Number, required: true }, // Giá
        stock: { type: Number, default: 0 }, // Số lượng tồn kho
        description: { type: String }, // Mô tả sản phẩm
        images: [{ type: String }], // Danh sách URL hình ảnh
        gender: {
            type: String,
            required: true,
            enum: ['nam', 'nu', 'unisex'],
        }, // Giới tính: nam, nữ, unisex
        size: { type: String, required: true, default: '' },
        color: { type: String, required: true, default: '' },
        material: { type: String, required: true, default: '' },
        brand: { type: String, required: true, default: '' },
    },

    { timestamps: true },
);

module.exports = mongoose.model('products', productSchema);
