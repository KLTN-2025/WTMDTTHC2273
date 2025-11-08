const modelCart = require('../models/cart.model');
const modelProduct = require('../models/product.models');
const modelCoupon = require('../models/coupon.model');

const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

class controllerCart {
    async addCart(req, res) {
        const { productId, quantity } = req.body;
        const { id } = req.user;

        const findProduct = await modelProduct.findById(productId);
        if (!findProduct) {
            throw new BadRequestError('Không tìm thấy sản phẩm');
        }

        if (quantity > findProduct.stock) {
            throw new BadRequestError('Số lượng trong kho không đủ');
        }

        const findCart = await modelCart.findOne({ userId: id });
        const totalPriceProduct = findProduct.price * quantity;

        if (!findCart) {
            // Tạo giỏ hàng mới nếu chưa có
            const newCart = await modelCart.create({
                userId: id,
                product: [{ productId, quantity }],
                totalPrice: totalPriceProduct,
            });

            await newCart.save();
            await modelProduct.updateOne({ _id: productId }, { $inc: { stock: -quantity } });

            new OK({
                message: 'Thêm sản phẩm vào giỏ hàng thành công',
                metadata: newCart,
            }).send(res);
        } else {
            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            const existingProductIndex = findCart.product.findIndex(
                (item) => item.productId.toString() === productId.toString(),
            );

            if (existingProductIndex !== -1) {
                // Sản phẩm đã có trong giỏ hàng - cập nhật số lượng
                const newQuantity = findCart.product[existingProductIndex].quantity + quantity;

                // Kiểm tra lại stock với số lượng mới
                if (newQuantity > findProduct.stock + findCart.product[existingProductIndex].quantity) {
                    throw new BadRequestError('Số lượng trong kho không đủ');
                }

                findCart.product[existingProductIndex].quantity = newQuantity;
            } else {
                // Sản phẩm chưa có trong giỏ hàng - thêm mới
                findCart.product.push({ productId, quantity });
            }

            findCart.totalPrice += totalPriceProduct;
            await findCart.save();
            await modelProduct.updateOne({ _id: productId }, { $inc: { stock: -quantity } });

            new OK({
                message: 'Thêm sản phẩm vào giỏ hàng thành công',
                metadata: findCart,
            }).send(res);
        }
    }

    async getCart(req, res) {
        const { id } = req.user;
        const cart = await modelCart.findOne({ userId: id });
        if (!cart) {
            new OK({ message: 'Thành công', metadata: { newData: [] } }).send(res);
        }

        const data = await Promise.all(
            cart.product.map(async (item) => {
                const product = await modelProduct.findById(item.productId);
                return { ...product._doc, quantity: item.quantity };
            }),
        );

        const newData = {
            data,
            totalPrice: cart.totalPrice,
        };
        new OK({ message: 'Thành công', metadata: { newData } }).send(res);
    }

    async deleteProductCart(req, res) {
        try {
            const { id } = req.user;
            const { productId } = req.query;

            const cart = await modelCart.findOne({ userId: id });
            if (!cart) {
                throw new BadRequestError('Không tìm thấy giỏ hàng');
            }

            const product = await modelProduct.findById(productId);
            if (!product) {
                throw new BadRequestError('Không tìm thấy sản phẩm');
            }

            const index = cart.product.findIndex((item) => item.productId.toString() === productId);
            if (index === -1) {
                throw new BadRequestError('Không tìm thấy sản phẩm trong giỏ hàng');
            }

            // Lưu lại số lượng sản phẩm trước khi xoá
            const removedProduct = cart.product[index];

            // Cập nhật totalPrice trước khi xoá sản phẩm
            cart.totalPrice -= product.price * removedProduct.quantity;

            // Xoá sản phẩm khỏi giỏ hàng
            cart.product.splice(index, 1);

            await cart.save();

            // Cập nhật lại số lượng tồn kho
            await modelProduct.updateOne({ _id: productId }, { $inc: { stock: removedProduct.quantity } });

            new OK({ message: 'Xoá thành công', metadata: cart }).send(res);
        } catch (error) {
            new BadRequestError(error.message).send(res);
        }
    }

    async updateInfoUserCart(req, res) {
        const { id } = req.user;
        const { fullName, phone, address } = req.body;
        const cart = await modelCart.findOne({ userId: id });
        if (!cart) {
            throw new BadRequestError('Không tìm thấy giỏ hàng');
        }
        cart.fullName = fullName;
        cart.phone = phone;
        cart.address = address;
        await cart.save();
        new OK({ message: 'Thành công', metadata: cart }).send(res);
    }

    async updateCart(req, res) {
        try {
            const userId = req.user?._id || req.body.userId;
            const { productId, quantity } = req.body;

            if (!userId || !productId || typeof quantity !== 'number') {
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
            }

            const product = await modelProduct.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }

            const cart = await modelCart.findOne({ userId });
            if (!cart) {
                return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
            }

            const productInCart = cart.product.find((item) => item.productId.toString() === productId);
            if (!productInCart) {
                return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
            }

            const availableStock = product.stock + productInCart.quantity;
            if (quantity > availableStock) {
                return res.status(400).json({ message: 'Số lượng tồn kho không đủ' });
            }

            await modelProduct.updateOne({ _id: productId }, { $inc: { stock: -quantity + productInCart.quantity } });

            productInCart.quantity = quantity;
            cart.totalPrice = await calcTotal(cart.product);
            await cart.save();

            res.status(200).json({
                message: 'Cập nhật giỏ hàng thành công',
                metadata: cart,
            });
        } catch (err) {
            res.status(500).json({
                message: 'Lỗi khi cập nhật giỏ hàng',
                error: err.message,
            });
        }
    }

    async applyCoupon(req, res) {
        try {
            const { nameCoupon } = req.body;
            const { id } = req.user;

            // Kiểm tra input
            if (!nameCoupon) {
                throw new BadRequestError('Vui lòng nhập mã giảm giá');
            }

            // Lấy thông tin giỏ hàng
            const dataCart = await modelCart.findOne({ userId: id });
            if (!dataCart) {
                throw new BadRequestError('Không tìm thấy giỏ hàng');
            }

            // Tìm coupon
            const findCoupon = await modelCoupon.findOne({ nameCoupon });
            if (!findCoupon) {
                throw new BadRequestError('Mã giảm giá không tồn tại');
            }

            // Kiểm tra coupon còn hiệu lực không
            const currentDate = new Date();
            if (findCoupon.expiryDate && findCoupon.expiryDate < currentDate) {
                throw new BadRequestError('Mã giảm giá đã hết hạn');
            }

            // Kiểm tra số lượng sử dụng (nếu có giới hạn)
            if (findCoupon.usageLimit && findCoupon.usedCount >= findCoupon.usageLimit) {
                throw new BadRequestError('Mã giảm giá đã hết lượt sử dụng');
            }

            let discountAmount = 0;
            const productUser = dataCart.product.map((item) => item.productId);

            // Xử lý logic áp dụng discount
            if (findCoupon.productUsed.includes('all')) {
                // Áp dụng cho tất cả sản phẩm
                discountAmount = findCoupon.discount;
            } else {
                // Kiểm tra sản phẩm có áp dụng được không
                const hasValidProduct = findCoupon.productUsed.some((product) => productUser.includes(product));

                if (!hasValidProduct) {
                    throw new BadRequestError('Mã giảm giá không áp dụng được cho sản phẩm trong giỏ hàng');
                }

                discountAmount = findCoupon.discount;
            }
            const totalPriProduct = await Promise.all(
                dataCart.product.map(async (item) => {
                    const product = await modelProduct.findById(item.productId);
                    return product.price * item.quantity;
                }),
            );

            // Tính toán tổng tiền sau khi giảm giá
            const newTotal = Math.max(0, totalPriProduct - discountAmount);

            // Cập nhật giỏ hàng
            const updatedCart = await modelCart.findOneAndUpdate(
                { userId: id },
                {
                    nameCoupon,
                    totalPrice: newTotal,
                    discountAmount: discountAmount,
                },
                { new: true },
            );

            new OK({
                message: 'Áp dụng mã giảm giá thành công',
                metadata: {
                    cart: updatedCart,
                    discount: discountAmount,
                    originalTotal: dataCart.totalPrice,
                    newTotal: newTotal,
                },
            }).send(res);
        } catch (error) {
            throw error;
        }
    }
}

// Hàm tính tổng tiền
async function calcTotal(productList) {
    let total = 0;
    for (const item of productList) {
        const product = await modelProduct.findById(item.productId);
        if (product) {
            total += product.price * item.quantity;
        }
    }
    return total;
}

module.exports = new controllerCart();
