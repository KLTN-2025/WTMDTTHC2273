const User = require('../models/users.model');
const Product = require('../models/product.models');
const Payment = require('../models/payments.model');

exports.getBasicStats = async (start, end) => {
    const [totalUsers, totalProducts, paymentsRange, completedOrders] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Payment.find({ createdAt: { $gte: start, $lte: end } }),
        Payment.countDocuments({
            statusOrder: { $in: ['completed', 'delivered'] },
        }),
    ]);

    return { totalUsers, totalProducts, paymentsRange, completedOrders };
};

exports.getTodayRevenue = async (start, end) => {
    const payments = await Payment.find({
        createdAt: { $gte: start, $lte: end },
        statusOrder: { $in: ['completed', 'delivered'] },
    });

    return payments.reduce((sum, p) => sum + Number(p.totalPrice || 0), 0);
};

exports.getMonthlySales = async (year) => {
    const result = await Payment.aggregate([
        {
            $match: {
                statusOrder: { $in: ['completed', 'delivered'] },
                createdAt: {
                    $gte: new Date(Date.UTC(year, 0, 1)),
                    $lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59)),
                },
            },
        },
        {
            $group: {
                _id: { month: { $month: '$createdAt' } },
                sales: { $sum: '$totalPrice' },
            },
        },
    ]);

    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return months.map((m, i) => ({
        month: m,
        sales: result.find((r) => r._id.month === i + 1)?.sales || 0,
    }));
};

exports.getWeeklyRevenue = async (fromDate) => {
    const payments = await Payment.find({
        createdAt: { $gte: fromDate },
        statusOrder: { $in: ['completed', 'delivered'] },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayIndex = today.getUTCDay();

    const revenueByDay = Array(7).fill(0);

    payments.forEach((p) => {
        const orderDate = new Date(p.createdAt);
        orderDate.setUTCHours(0, 0, 0, 0);

        const dayIndex = orderDate.getUTCDay();
        revenueByDay[dayIndex] += Number(p.totalPrice || 0);
    });

    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const result = [];
    for (let i = 6; i >= 0; i--) {
        const index = (todayIndex - i + 7) % 7;
        result.push({
            _id: dayNames[index],
            dailyRevenue: revenueByDay[index],
        });
    }

    return result;
};

exports.getRecentOrders = async (limit = 6) => {
    const orders = await Payment.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('products.productId', 'name')
        .lean();

    return orders.map((o, i) => ({
        key: i + 1,
        order: o._id.toString().slice(-6).toUpperCase(),
        customer: o.fullName,
        amount: o.totalPrice,
        status: o.statusOrder,
    }));
};
