const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelPreviewProduct = new Schema(
    {
        productId: { type: String, require: true, ref: 'product' },
        userId: { type: String, require: true, ref: 'user' },
        rating: { type: Number, default: 0 },
        content: { type: String, default: '' },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('previewProduct', modelPreviewProduct);
