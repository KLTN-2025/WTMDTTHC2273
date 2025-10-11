const modelPreviewProduct = require('../models/previewProduct.model');
const modelProduct = require('../models/product.models');

const { OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');

class PreviewProductController {
    async createPreviewProduct(req, res, next) {
        const { id } = req.user;
        const { productId, rating, content } = req.body;
        const newPreviewProduct = await modelPreviewProduct.create({ productId, userId: id, rating, content });
        if (!newPreviewProduct) {
            throw new BadRequestError('Thất bại');
        }
        new OK({ message: 'Thành công', metadata: { newData: newPreviewProduct } }).send(res);
    }

    async getPreviewProduct(req, res, next) {
        const { id } = req.user;
        const findPreviewProduct = await modelPreviewProduct.find({ userId: id });
        const data = await Promise.all(
            findPreviewProduct.map(async (item) => {
                const findProduct = await modelProduct.findById(item.productId);
                return {
                    ...item._doc,
                    product: findProduct,
                };
            }),
        );
        new OK({ message: 'Thành công', metadata: data }).send(res);
    }
}

module.exports = new PreviewProductController();
