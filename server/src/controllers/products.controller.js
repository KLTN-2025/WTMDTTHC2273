const modelProduct = require('../models/product.models');
const { OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const cloudinary = require('../utils/configCloudDinary');
const modelCoupon = require('../models/coupon.model');
const modelPreviewProduct = require('../models/previewProduct.model');
const modelUser = require('../models/users.model');

function getPublicId(url) {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');

    if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL');
    }

    const pathParts = parts.slice(uploadIndex + 1);
    const pathWithoutVersion = pathParts[0].startsWith('v') ? pathParts.slice(1) : pathParts;
    const publicIdWithExt = pathWithoutVersion.join('/');
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));

    return publicId;
}

class controllerProducts {
    async createProduct(req, res) {
        const { name, category, gender, price, stock, description, attributes, images } = req.body;

        // Kiểm tra đầy đủ thông tin bắt buộc
        if (!name || !category || !gender || !price || !stock || !description || !attributes || !images) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin sản phẩm');
        }

        // Kiểm tra category hợp lệ
        const validCategories = ['ao', 'quan', 'vay', 'dam', 'phu_kien', 'giay_dep', 'tui_xach'];
        if (!validCategories.includes(category)) {
            throw new BadRequestError('Danh mục sản phẩm không hợp lệ');
        }

        // Kiểm tra gender hợp lệ
        const validGenders = ['nam', 'nu', 'unisex'];
        if (!validGenders.includes(gender)) {
            throw new BadRequestError('Giới tính sản phẩm không hợp lệ');
        }

        // Kiểm tra attributes theo category
        let requiredAttributes = ['color', 'brand'];

        switch (category) {
            case 'ao':
            case 'quan':
            case 'vay':
            case 'dam':
                requiredAttributes.push('size', 'material');
                break;
            case 'giay_dep':
                requiredAttributes.push('size');
                break;
            case 'phu_kien':
            case 'tui_xach':
                requiredAttributes.push('material');
                break;
        }

        for (const attr of requiredAttributes) {
            if (!attributes[attr]) {
                throw new BadRequestError(`Vui lòng nhập ${attr} của sản phẩm`);
            }
        }

        const newProduct = await modelProduct.create({
            name,
            category,
            gender,
            price,
            stock,
            description,
            attributes,
            images,
        });

        new OK({ message: 'Tạo sản phẩm thành công', metadata: newProduct }).send(res);
    }

    async uploadImage(req, res) {
        if (!req.files) {
            return;
        }
        const { typeImages } = req.body;
        if (typeImages === 'product') {
            const files = req.files;
            const uploadPromises = files.map((file) => {
                return cloudinary.uploader.upload(file.path, {
                    folder: 'products',
                    resource_type: 'auto',
                });
            });
            const uploadedImages = await Promise.all(uploadPromises);
            const data = uploadedImages.map((image) => image.secure_url);

            new OK({ message: 'Tạo sản phẩm thông tin', metadata: data }).send(res);
        } else if (typeImages === 'blog') {
            const files = req.files;
            const uploadPromises = files.map((file) => {
                return cloudinary.uploader.upload(file.path, {
                    folder: 'blogs',
                    resource_type: 'auto',
                });
            });
            const uploadedImages = await Promise.all(uploadPromises);
            const data = uploadedImages.map((image) => image.secure_url);

            new OK({ message: 'Tạo bài viet thông tin', metadata: data }).send(res);
        }
    }

    async getProduct(req, res) {
        try {
            const products = await modelProduct.find();

            // Nhóm sản phẩm theo category
            const categorizedProducts = products.reduce((acc, product) => {
                if (!acc[product.category]) {
                    acc[product.category] = [];
                }
                if (acc[product.category].length < 8) {
                    // Giới hạn mỗi category 8 sản phẩm
                    acc[product.category].push(product);
                }
                return acc;
            }, {});

            new OK({
                message: 'Lấy danh sách sản phẩm thành công',
                metadata: categorizedProducts,
            }).send(res);
        } catch (error) {
            new BadRequestError({
                message: 'Lỗi khi lấy danh sách sản phẩm',
                error: error.message,
            }).send(res);
        }
    }

    async getOneProduct(req, res) {
        const { id } = req.query;
        const product = await modelProduct.findById(id);

        const currentDate = new Date();
        const dataCoupon = await modelCoupon.find({
            minPrice: { $lte: product.price },
            quantity: { $gt: 0 },
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            $or: [{ productUsed: 'all' }, { productUsed: product._id.toString() }],
        });

        const findPreviewProduct = await modelPreviewProduct.find({ productId: id });
        const dataPreivew = await Promise.all(
            findPreviewProduct.map(async (item) => {
                const user = await modelUser.findById(item.userId);
                return {
                    ...item._doc,
                    user,
                };
            }),
        );

        if (!product) {
            throw new BadRequestError('Không tìm thấy sản phẩm');
        }
        new OK({
            message: 'Lấy thống tin sản phẩm thành cong',
            metadata: { product, dataCoupon, dataPreivew },
        }).send(res);
    }

    async filterProducts(req, res) {
        try {
            const { category, minPrice, maxPrice, searchQuery, brand, origin, sortBy } = req.query;

            // Xây dựng query filter
            let filter = {};

            // Filter theo category
            if (category) {
                filter.category = category;
            }

            // Filter theo khoảng giá
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.$gte = Number(minPrice);
                if (maxPrice) filter.price.$lte = Number(maxPrice);
            }

            // Filter theo tìm kiếm
            if (searchQuery) {
                filter.name = { $regex: searchQuery, $options: 'i' };
            }

            // Filter theo thương hiệu
            if (brand) {
                filter['attributes.brand'] = brand;
            }

            // Filter theo xuất xứ
            if (origin) {
                filter['attributes.origin'] = origin;
            }

            // Xây dựng options cho sort
            let sortOptions = {};
            if (sortBy) {
                switch (sortBy) {
                    case 'price_asc':
                        sortOptions = { price: 1 };
                        break;
                    case 'price_desc':
                        sortOptions = { price: -1 };
                        break;
                    default:
                        sortOptions = { createdAt: -1 };
                }
            }

            // Thực hiện query với filter và sort
            const products = await modelProduct.find(filter).sort(sortOptions);

            new OK({
                message: 'Lọc sản phẩm thành công',
                metadata: products,
            }).send(res);
        } catch (error) {
            new BadRequestError({
                message: 'Lỗi khi lọc sản phẩm',
                error: error.message,
            }).send(res);
        }
    }

    async getAllProducts(req, res) {
        try {
            const page = Math.max(parseInt(req.query.page) || 1, 1); // Đảm bảo page >= 1
            const limit = Math.max(parseInt(req.query.limit) || 10, 1); // Đảm bảo limit >= 1

            const skip = (page - 1) * limit;

            // Thực hiện song song cả 2 query để tối ưu performance
            const [totalProducts, products] = await Promise.all([
                modelProduct.countDocuments(),
                modelProduct
                    .find()
                    .sort({ createdAt: -1 }) // Sắp xếp mới nhất lên đầu
                    .skip(skip)
                    .limit(limit),
            ]);

            const totalPages = Math.ceil(totalProducts / limit);

            // Kiểm tra page hợp lệ
            if (page > totalPages && totalProducts > 0) {
                throw new BadRequestError('Trang yêu cầu vượt quá số trang hiện có');
            }

            new OK({
                message: 'Lấy danh sách sản phẩm thành công',
                metadata: {
                    products,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalProducts,
                        productsPerPage: limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1,
                    },
                },
            }).send(res);
        } catch (error) {
            new BadRequestError({
                message: 'Lỗi khi lấy danh sách sản phẩm',
                error: error.message,
            }).send(res);
        }
    }

    async editProduct(req, res) {
        try {
            const { _id } = req.body;
            const product = await modelProduct.findByIdAndUpdate(_id, {
                ...req.body,
            });
            if (!product) {
                throw new BadRequestError('Không tìm thấy sản phẩm');
            }
            new OK({ message: 'Chiềnh sửa thống tin sản phẩm thành cong', metadata: product }).send(res);
        } catch (error) {
            new BadRequestError({
                message: 'Lỗi khi chiềnh sửa thống tin sản phẩm',
                error: error.message,
            }).send(res);
        }
    }

    async deleteProduct(req, res) {
        const { id } = req.query;
        const product = await modelProduct.findOne({ _id: id });

        if (!product) {
            throw new BadRequestError('Không tìm thấy sản phẩm');
        }

        const images = product.images;

        // Chuyển image URL -> public_id và xóa từ Cloudinary
        const deletePromises = images.map((imageUrl) => {
            const publicId = getPublicId(imageUrl);
            console.log('Public ID:', publicId); // Debug: kiểm tra public_id

            return cloudinary.uploader.destroy(publicId);
        });

        try {
            // Xóa tất cả images từ Cloudinary
            const deleteResults = await Promise.all(deletePromises);
            console.log('Delete results:', deleteResults); // Debug: kiểm tra kết quả xóa

            // Xóa product từ database
            await modelProduct.findByIdAndDelete(id);

            new OK({
                message: 'Xoá sản phẩm thành công',
                metadata: product,
            }).send(res);
        } catch (error) {
            console.error('Error deleting images:', error);
            throw new BadRequestError('Lỗi khi xóa hình ảnh sản phẩm');
        }
    }
    async searchProduct(req, res) {
        const { keyword } = req.query;
        const data = await modelProduct.find({
            name: { $regex: keyword, $options: 'i' },
        });
        new OK({ message: 'Tìm kiếm sản phẩm', metadata: data }).send(res);
    }

    async deleteImage(req, res) {
        const { id } = req.body;

        const idImages = getPublicId(id);
        const deleteResults = await cloudinary.uploader.destroy(idImages);
        new OK({ message: 'Xoá hình ảnh thành công', metadata: deleteResults }).send(res);
    }

    async getAllProductAdmin(req, res) {
        const data = await modelProduct.find();
        new OK({ message: 'Lấy danh sách sản phẩm thành công', metadata: data }).send(res);
    }
}

module.exports = new controllerProducts();
