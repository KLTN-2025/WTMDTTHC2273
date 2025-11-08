const modelPayments = require('../models/payments.model');
const modelCart = require('../models/cart.model');
const modelProduct = require('../models/product.models');
const modelCoupon = require('../models/coupon.model');
const modelPreviewProduct = require('../models/previewProduct.model');

const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const https = require('https');

const axios = require('axios');
const crypto = require('crypto');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

class controllerPayments {
    async payment(req, res) {
        const { id } = req.user;
        const { typePayment } = req.body;
        if (!typePayment) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        const findCart = await modelCart.findOne({ userId: id });
        if (!findCart) {
            throw new BadRequestError('Không tìm thấy giỏ hàng');
        }
        if (findCart.address === '' || findCart.phone === '' || findCart.fullName === '') {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        if (typePayment === 'COD') {
            const newPayment = new modelPayments({
                userId: id,
                products: findCart.product,
                address: findCart.address,
                phone: findCart.phone,
                fullName: findCart.fullName,
                typePayments: 'COD',
                totalPrice: findCart.totalPrice,
                statusOrder: 'pending',
                nameCoupon: findCart.nameCoupon,
            });
            await newPayment.save();
            await findCart.deleteOne();

            new OK({ message: 'Thanh toán thành công', metadata: newPayment._id }).send(res);
        }
        if (typePayment === 'MOMO') {
            const data = new Promise(async (resolve, reject) => {
                const accessKey = 'F8BBA842ECF85';
                const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
                const partnerCode = 'MOMO';
                const orderId = partnerCode + new Date().getTime();
                const requestId = orderId;
                const orderInfo = `Thanh toan don hang ${findCart._id}`;
                const redirectUrl = 'http://localhost:3000/api/check-payment-momo';
                const ipnUrl = 'http://localhost:3000/api/check-payment-momo';
                const requestType = 'payWithMethod';
                const amount = findCart.totalPrice;
                const extraData = '';

                const rawSignature =
                    'accessKey=' +
                    accessKey +
                    '&amount=' +
                    amount +
                    '&extraData=' +
                    extraData +
                    '&ipnUrl=' +
                    ipnUrl +
                    '&orderId=' +
                    orderId +
                    '&orderInfo=' +
                    orderInfo +
                    '&partnerCode=' +
                    partnerCode +
                    '&redirectUrl=' +
                    redirectUrl +
                    '&requestId=' +
                    requestId +
                    '&requestType=' +
                    requestType;

                const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

                const requestBody = JSON.stringify({
                    partnerCode,
                    partnerName: 'Test',
                    storeId: 'MomoTestStore',
                    requestId,
                    amount,
                    orderId,
                    orderInfo,
                    redirectUrl,
                    ipnUrl,
                    lang: 'vi',
                    requestType,
                    autoCapture: true,
                    extraData,
                    orderGroupId: '',
                    signature,
                });

                const options = {
                    hostname: 'test-payment.momo.vn',
                    port: 443,
                    path: '/v2/gateway/api/create',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(requestBody),
                    },
                };

                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        } catch (err) {
                            reject(err);
                        }
                    });
                });

                req.on('error', (e) => reject(e));
                req.write(requestBody);
                req.end();
            });

            const { payUrl } = await data;

            return res.status(201).json({
                message: 'success',
                metadata: payUrl,
            });
        }
        if (typePayment === 'VNPAY') {
            const vnpay = new VNPay({
                tmnCode: 'DH2F13SW',
                secureSecret: '7VJPG70RGPOWFO47VSBT29WPDYND0EJG',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true, // tùy chọn
                hashAlgorithm: 'SHA512', // tùy chọn
                loggerFn: ignoreLogger, // tùy chọn
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayResponse = await vnpay.buildPaymentUrl({
                vnp_Amount: findCart.totalPrice, //
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: findCart._id,
                vnp_OrderInfo: `${findCart._id}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:3000/api/check-payment-vnpay`, //
                vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
            });
            new OK({ message: 'Thanh toán thông báo', metadata: vnpayResponse }).send(res);
        }
    }

    async checkPaymentMomo(req, res, next) {
        const { orderInfo, resultCode } = req.query;
        if (resultCode === '0') {
            const result = orderInfo.split(' ')[4];
            const findCart = await modelCart.findOne({ _id: result });
            const newPayment = new modelPayments({
                userId: findCart.userId,
                products: findCart.product,
                address: findCart.address,
                phone: findCart.phone,
                fullName: findCart.fullName,
                typePayments: 'MOMO',
                totalPrice: findCart.totalPrice,
                statusOrder: 'pending',
                nameCoupon: findCart.nameCoupon,
            });
            await newPayment.save();
            await findCart.deleteOne();
            return res.redirect(`http://localhost:5173/payment/${newPayment._id}`);
        }
    }

    async checkPaymentVnpay(req, res) {
        const { vnp_ResponseCode, vnp_OrderInfo } = req.query;
        if (vnp_ResponseCode === '00') {
            const idCart = vnp_OrderInfo;
            const findCart = await modelCart.findOne({ _id: idCart });
            const newPayment = new modelPayments({
                userId: findCart.userId,
                products: findCart.product,
                address: findCart.address,
                phone: findCart.phone,
                typePayments: 'VNPAY',
                fullName: findCart.fullName,
                totalPrice: findCart.totalPrice,
                statusOrder: 'pending',
                nameCoupon: findCart.nameCoupon,
            });
            await newPayment.save();
            await findCart.deleteOne();
            return res.redirect(`http://localhost:5173/payment/${newPayment._id}`);
        }
    }

    async getHistoryOrder(req, res) {
        const { id } = req.user;
        const payments = await modelPayments.find({ userId: id });

        const orders = await Promise.all(
            payments.map(async (order) => {
                const products = await Promise.all(
                    order.products.map(async (item) => {
                        const product = await modelProduct.findById(item.productId);

                        if (!product) {
                            return {
                                productId: item.productId,
                                name: 'Sản phẩm không còn tồn tại',
                                image: '',
                                price: 0,
                                quantity: item.quantity,
                                status: 'deleted',
                            };
                        }

                        let productDetails = {
                            productId: product._id,
                            name: product.name,
                            image: product.images[0],
                            price: product.price,
                            quantity: item.quantity,
                            category: product.category,
                            gender: product.gender,
                            brand: product.attributes?.brand || '',
                            status: 'active',
                        };

                        if (['ao', 'quan', 'vay', 'dam'].includes(product.category)) {
                            productDetails = {
                                ...productDetails,
                                size: product.attributes?.size || '',
                                color: product.attributes?.color || '',
                                material: product.attributes?.material || '',
                            };
                        } else if (product.category === 'giay_dep') {
                            productDetails = {
                                ...productDetails,
                                size: product.attributes?.size || '',
                                color: product.attributes?.color || '',
                            };
                        } else if (['phu_kien', 'tui_xach'].includes(product.category)) {
                            productDetails = {
                                ...productDetails,
                                color: product.attributes?.color || '',
                                material: product.attributes?.material || '',
                            };
                        }

                        return productDetails;
                    }),
                );

                const findPreviewProduct = await modelPreviewProduct.find({
                    productId: { $in: products.map((item) => item.productId) },
                });

                return {
                    orderId: order._id,
                    fullName: order.fullName,
                    phone: order.phone,
                    address: order.address,
                    totalPrice: order.totalPrice,
                    typePayments: order.typePayments,
                    statusOrder: order.statusOrder,
                    createdAt: order.createdAt,
                    products,
                    paymentStatus: order.typePayments === 'COD' ? 'Thanh toán khi nhận hàng' : 'Đã thanh toán',
                    previewProduct: findPreviewProduct,
                };
            }),
        );

        new OK({
            message: 'Thành công',
            metadata: {
                orders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
            },
        }).send(res);
    }

    async getOnePayment(req, res, next) {
        try {
            const { id } = req.query;
            if (!id) {
                throw new BadRequestError('Không tìm thấy đơn hàng');
            }

            const findPayment = await modelPayments.findById(id);

            if (!findPayment) {
                throw new BadRequestError('Không tìm thấy đơn hàng');
            }

            const dataProduct = await Promise.all(
                findPayment.products.map(async (item) => {
                    const product = await modelProduct.findById(item.productId);
                    return {
                        product: product,
                        quantity: item.quantity,
                    };
                }),
            );
            const data = { findPayment, dataProduct };

            new OK({ message: 'Thành công', metadata: data }).send(res);
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    async filterOrder(req, res, next) {
        try {
            const { statusOrder } = req.query;
            const payments = statusOrder ? await modelPayments.find({ statusOrder }) : await modelPayments.find();

            const orders = await Promise.all(
                payments.map(async (order) => {
                    const products = await Promise.all(
                        order.products.map(async (item) => {
                            const product = await modelProduct.findById(item.productId);
                            if (!product) {
                                return {
                                    productId: item.productId,
                                    name: 'Sản phẩm không tồn tại',
                                    image: '',
                                    price: 0,
                                    quantity: item.quantity,
                                };
                            }
                            return {
                                productId: product._id,
                                name: product.name,
                                image: product.images[0],
                                price: product.price,
                                quantity: item.quantity,
                            };
                        }),
                    );

                    return {
                        orderId: order._id,
                        fullName: order.fullName,
                        phone: order.phone,
                        address: order.address,
                        totalPrice: order.totalPrice,
                        typePayments: order.typePayments,
                        statusOrder: order.statusOrder,
                        createdAt: order.createdAt,
                        products,
                    };
                }),
            );

            new OK({ message: 'Thành công', metadata: { orders } }).send(res);
        } catch (error) {
            next(error);
        }
    }

    async updateStatusOrder(req, res, next) {
        const { statusOrder, orderId } = req.body;
        const findPayment = await modelPayments.findById(orderId);
        if (!findPayment) {
            throw new BadRequestError('Không tìm thấy đơn hàng');
        }
        findPayment.statusOrder = statusOrder;
        if (statusOrder === 'completed') {
            await modelCoupon.findOneAndUpdate({ nameCoupon: findPayment.nameCoupon }, { $inc: { quantity: -1 } });
        }
        await findPayment.save();
        new OK({ message: 'Thành công', metadata: findPayment }).send(res);
    }
}

module.exports = new controllerPayments();
