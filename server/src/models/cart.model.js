const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelCart = new Schema(
    {
        userId: { type: String, required: true },
        fullName: { type: String, default: '' },
        phone: { type: Number, default: '' },
        address: { type: String, default: '' },
        product: [
            {
                productId: { type: String, required: true },
                quantity: { type: Number, required: true },
            },
        ],
        totalPrice: { type: Number, required: true },
        nameCoupon: { type: String, default: '' },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('cart', modelCart);
