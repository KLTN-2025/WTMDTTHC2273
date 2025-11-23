const modelUser = require('../models/users.model');
const modelPayments = require('../models/payments.model');
const modelApiKey = require('../models/apiKey.model');
const modelOtp = require('../models/otp.model');

const { BadRequestError } = require('../core/error.response');
const { createApiKey, createToken, createRefreshToken, verifyToken } = require('../services/tokenSevices');
const MailForgotPassword = require('../services/MailForgotPassword');
const { Created, OK } = require('../core/success.response');

const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const { jwtDecode } = require('jwt-decode');

class controllerUsers {
    async register(req, res) {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            throw new BadRequestError('Vui lòng nhập đày đủ thông tin');
        }
        const user = await modelUser.findOne({ email });
        if (user) {
            throw new BadRequestError('Người dùng đã tồn tại');
        } else {
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const passwordHash = bcrypt.hashSync(password, salt);
            const newUser = await modelUser.create({
                fullName,
                email,
                password: passwordHash,
                typeLogin: 'email',
                phone,
            });
            await newUser.save();
            await createApiKey(newUser._id);
            const token = await createToken({ id: newUser._id });
            const refreshToken = await createRefreshToken({ id: newUser._id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });

            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });

            // Đặt cookie HTTP-Only cho refreshToken (tùy chọn)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new Created({ message: 'Đăng ký thành công', metadata: { token, refreshToken } }).send(res);
        }
    }

    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const user = await modelUser.findOne({ email });
        if (!user) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        if (user.typeLogin === 'google') {
            throw new BadRequestError('Tài khoản đăng nhập bằng google');
        }

        const checkPassword = bcrypt.compareSync(password, user.password);
        if (!checkPassword) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        await createApiKey(user._id);
        const token = await createToken({ id: user._id });
        const refreshToken = await createRefreshToken({ id: user._id });

        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        // Đặt cookie HTTP-Only cho refreshToken (tùy chọn)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
    }

    async loginGoogle(req, res) {
        const { credential } = req.body;
        const dataToken = jwtDecode(credential);
        const user = await modelUser.findOne({ email: dataToken.email });
        if (user) {
            await createApiKey(user._id);
            const token = await createToken({ id: user._id });
            const refreshToken = await createRefreshToken({ id: user._id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        } else {
            const newUser = await modelUser.create({
                fullName: dataToken.name,
                email: dataToken.email,
                typeLogin: 'google',
            });
            await newUser.save();
            await createApiKey(newUser._id);
            const token = await createToken({ id: newUser._id });
            const refreshToken = await createRefreshToken({ id: newUser._id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        }
    }

    async authUser(req, res) {
        const user = req.user;
        const findUser = await modelUser.findOne({ _id: user.id });
        if (!findUser) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        const userString = JSON.stringify(findUser);
        const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_CRYPTO).toString();
        new OK({ message: 'success', metadata: { auth } }).send(res);
    }

    async logout(req, res) {
        const user = req.user;
        await modelApiKey.deleteOne({ userId: user.id });
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.clearCookie('logged');

        new OK({ message: 'Đăng xuất thành công' }).send(res);
    }

    async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;

        const decoded = await verifyToken(refreshToken);

        const user = await modelUser.findById(decoded.id);
        const token = await createToken({ id: user._id });
        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        new OK({ message: 'Refresh token thành công', metadata: { token } }).send(res);
    }

    async getAdminStats(req, res) {
        try {
            // Get total users count
            const totalUsers = await modelUser.countDocuments();

            // Get today's orders and revenue
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayOrders = await modelPayments.find({
                createdAt: { $gte: today },
            });

            const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
            const newOrders = await modelPayments.countDocuments({
                statusOrder: 'pending',
            });

            // Tạo mảng 7 ngày gần nhất
            const last7DaysArray = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date.toISOString().split('T')[0];
            }).reverse();

            // Get last 7 days revenue
            const last7Days = new Date();
            last7Days.setDate(last7Days.getDate() - 7);

            const weeklyRevenue = await modelPayments.aggregate([
                {
                    $match: {
                        createdAt: { $gte: last7Days },
                        statusOrder: { $ne: 'cancelled' },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        dailyRevenue: { $sum: '$totalPrice' },
                    },
                },
                { $sort: { _id: 1 } },
            ]);

            // Map revenue data to ensure all 7 days are included
            const formattedWeeklyRevenue = last7DaysArray.map((date) => {
                const dayData = weeklyRevenue.find((item) => item._id === date);
                return {
                    _id: date,
                    dailyRevenue: dayData ? dayData.dailyRevenue : 0,
                    // Thêm label ngày trong tuần
                    dayLabel: new Date(date).toLocaleDateString('vi-VN', { weekday: 'short' }),
                };
            });

            // Get recent orders
            const recentOrders = await modelPayments
                .find()
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('userId', 'fullName');

            const formattedRecentOrders = recentOrders.map((order) => ({
                key: order._id.toString(),
                order: order._id.toString().slice(-6).toUpperCase(),
                customer: order.fullName,
                product: `${order.products.length} sản phẩm`,
                amount: order.totalPrice,
                status:
                    order.statusOrder === 'pending'
                        ? 'Chờ xử lý'
                        : order.statusOrder === 'shipping'
                        ? 'Đang giao'
                        : order.statusOrder === 'delivered'
                        ? 'Đã giao'
                        : 'Đã hủy',
            }));

            new OK({
                message: 'Lấy thống kê thành công',
                metadata: {
                    totalUsers,
                    newOrders,
                    todayRevenue,
                    weeklyRevenue: formattedWeeklyRevenue,
                    recentOrders: formattedRecentOrders,
                },
            }).send(res);
        } catch (error) {
            throw new BadRequestError('Lỗi khi lấy thống kê');
        }
    }

    async getAllUser(req, res) {
        const users = await modelUser.find();
        new OK({ message: 'Lấy thống kê thông tin người dùng', metadata: { users } }).send(res);
    }

    async changePassword(req, res) {
        const { id } = req.user;
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (!oldPassword || !newPassword || !confirmPassword) {
            throw new BadRequestError('Vui lòng nhập đày đủ thông tin');
        }

        if (newPassword !== confirmPassword) {
            throw new BadRequestError('Mật khẩu không khớp');
        }

        const user = await modelUser.findById(id);
        if (!user) {
            throw new BadRequestError('Không tìm thấy người dùng');
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new BadRequestError('Mật khẩu cũ không chính xác');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();
        new OK({ message: 'Đổi mật khẩu thành công' }).send(res);
    }

    async sendMailForgotPassword(req, res) {
        const { email } = req.body;
        if (!email) {
            throw new BadRequestError('Vui lòng nhập email');
        }
        const user = await modelUser.findOne({ email });
        if (!user) {
            throw new BadRequestError('Không tìm thấy người dùng');
        }
        const otp = await otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        const findOtp = await modelOtp.findOne({ email });
        if (findOtp) {
            await modelOtp.deleteOne({ email });
        }

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(otp, salt);

        await modelOtp.create({ email: user.email, otp: passwordHash });
        await MailForgotPassword(email, otp);
        const token = jwt.sign({ email: user.email }, '123456', { expiresIn: '15m' });
        res.cookie('tokenOtp', token, {
            httpOnly: false,
            secure: true,
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000,
        });
        new OK({ message: 'Vui lòng kiểm tra email' }).send(res);
    }

    async verifyOtp(req, res) {
        const { otp, newPassword } = req.body;
        const token = req.cookies.tokenOtp;
        const { email } = jwt.verify(token, '123456');

        if (!otp || !newPassword) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findOtp = await modelOtp.findOne({ email: email }).sort({ createdAt: -1 });
        if (!findOtp) {
            throw new BadRequestError('Không tìm thấy otp');
        }
        const checkOtp = bcrypt.compareSync(otp, findOtp.otp);
        if (!checkOtp) {
            throw new BadRequestError('OTP không chính xác');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await modelUser.updateOne({ email }, { password: hashedPassword });
        await modelOtp.deleteOne({ email });
        res.clearCookie('tokenOtp');
        new OK({ message: 'Cập nhật mật khẩu thành công' }).send(res);
    }

    async editRoleUser(req, res) {
        const { isAdmin, id } = req.body;
        const user = await modelUser.findById(id);
        if (!user) {
            throw new BadRequestError('Không tìm thấy người dùng');
        }
        user.isAdmin = isAdmin;
        await user.save();
        new OK({ message: 'Cập nhật quyền quản trị thành công' }).send(res);
    }

    async editUser(req, res) {
        const { id } = req.user;
        const dataUser = await modelUser.findOneAndUpdate({ _id: id }, req.body, { new: true });
        new OK({ message: 'Cập nhật thông tin thành công', metadata: { dataUser } }).send(res);
    }

    async getStatistics(req, res) {
        try {
            const { startDate, endDate } = req.query;

            // Chuẩn hóa ngày lọc
            const start = startDate ? new Date(startDate) : new Date();
            const end = endDate ? new Date(endDate) : new Date();
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            const today = new Date();
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const User = require('../models/users.model');
            const Product = require('../models/product.models');
            const Payment = require('../models/payments.model');

            // Query song song
            const [totalUsers, totalProducts, paymentsRange, paymentsToday, completedOrders] = await Promise.all([
                User.countDocuments(),
                Product.countDocuments(),
                Payment.find({
                    createdAt: { $gte: start, $lte: end },
                }),
                Payment.find({
                    createdAt: { $gte: todayStart, $lte: today },
                    statusOrder: { $in: ['completed', 'delivered'] },
                }),
                Payment.countDocuments({
                    statusOrder: { $in: ['completed', 'delivered'] },
                }),
            ]);

            // Revenue today
            const todayRevenue = paymentsToday.reduce((t, p) => t + p.totalPrice, 0);

            // Doanh số theo tháng
            const monthlySalesAgg = await Payment.aggregate([
                {
                    $match: {
                        statusOrder: { $in: ['completed', 'delivered'] },
                        createdAt: {
                            $gte: new Date(today.getFullYear(), 0, 1),
                            $lte: new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999),
                        },
                    },
                },
                {
                    $group: {
                        _id: { month: { $month: '$createdAt' } },
                        sales: { $sum: '$totalPrice' },
                    },
                },
                { $sort: { '_id.month': 1 } },
            ]);

            const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
            const monthlySales = monthNames.map((name, index) => {
                const monthData = monthlySalesAgg.find((m) => m._id.month === index + 1);
                return {
                    month: name,
                    sales: monthData ? monthData.sales : 0,
                };
            });

            // Weekly revenue (7 ngày gần nhất theo timeline)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            const paymentsLast7Days = await Payment.find({
                createdAt: { $gte: sevenDaysAgo },
                statusOrder: { $in: ['completed', 'delivered'] },
            });

            const dailyMap = Array(7).fill(0);

            paymentsLast7Days.forEach((p) => {
                const diff = Math.floor((today - new Date(p.createdAt)) / (1000 * 60 * 60 * 24));
                const index = 6 - diff; // từ 6 -> 0 (timeline)
                if (index >= 0 && index < 7) {
                    dailyMap[index] += p.totalPrice;
                }
            });

            const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
            const weeklyRevenue = dayNames.map((d, i) => ({
                _id: d,
                dailyRevenue: dailyMap[i],
            }));

            // Recent orders (chỉ lấy đơn thành công)
            const recentOrdersRaw = await Payment.find().sort({ createdAt: -1 }).limit(6).lean();

            const formattedRecentOrders = await Promise.all(
                recentOrdersRaw.map(async (order, index) => {
                    const firstProduct = order.products?.[0];

                    const productData = firstProduct ? await Product.findById(firstProduct.productId).lean() : null;

                    return {
                        key: index + 1,
                        order: order._id.toString().slice(-6).toUpperCase(),
                        customer: order.fullName,
                        product: productData?.name || 'Không có sản phẩm',
                        amount: order.totalPrice,
                        status: order.statusOrder,
                    };
                }),
            );

            // Conversion rate
            const conversion = totalUsers ? Math.round((completedOrders / totalUsers) * 100) : 0;

            return res.status(200).json({
                status: 'success',
                code: 200,
                metadata: {
                    totalUsers,
                    newOrders: paymentsRange.filter((p) => ['completed', 'delivered'].includes(p.statusOrder)).length,
                    todayRevenue,
                    totalProducts,
                    monthlySales,
                    conversion,
                    weeklyRevenue,
                    recentOrders: formattedRecentOrders,
                },
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: 'error',
                message: 'Lỗi khi lấy thống kê',
            });
        }
    }
}

module.exports = new controllerUsers();
