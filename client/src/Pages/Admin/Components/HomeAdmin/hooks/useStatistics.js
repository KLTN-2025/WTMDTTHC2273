import { useState } from 'react';
import { requestGetStatistics } from '../../../../../config/request';
import moment from 'moment';

// Mock fallback khi API lỗi
const MOCK_DATA = {
    totalUsers: 1458,
    newOrders: 124,
    todayRevenue: 12500000,
    totalProducts: 347,
    conversion: 68,
    userGrowth: 12.3,
    orderGrowth: 8.4,
    revenueGrowth: 15.7,
    weeklyRevenue: [
        { _id: 'T2', dailyRevenue: 8500000 },
        { _id: 'T3', dailyRevenue: 9200000 },
        { _id: 'T4', dailyRevenue: 11500000 },
        { _id: 'T5', dailyRevenue: 10800000 },
        { _id: 'T6', dailyRevenue: 14200000 },
        { _id: 'T7', dailyRevenue: 18500000 },
        { _id: 'CN', dailyRevenue: 16200000 },
    ],
    categorySales: [],
    monthlySales: [
        { month: 'T1', sales: 65000000 },
        { month: 'T2', sales: 59000000 },
        { month: 'T3', sales: 80000000 },
        { month: 'T4', sales: 81000000 },
        { month: 'T5', sales: 90000000 },
        { month: 'T6', sales: 105000000 },
        { month: 'T7', sales: 110000000 },
        { month: 'T8', sales: 125000000 },
        { month: 'T9', sales: 130000000 },
        { month: 'T10', sales: 140000000 },
        { month: 'T11', sales: 170000000 },
        { month: 'T12', sales: 190000000 },
    ],
    trafficSources: [],
    recentOrders: [],
};

export default function useStatistics() {
    const [stats, setStats] = useState(MOCK_DATA);
    const [isLoading, setIsLoading] = useState(false);

    const fetchStats = async ({ startDate, endDate }) => {
        setIsLoading(true);
        try {
            const res = await requestGetStatistics({
                startDate: moment(startDate).format('YYYY-MM-DD'),
                endDate: moment(endDate).format('YYYY-MM-DD'),
            });

            if (res?.status === 'success' && res.metadata) {
                setStats({
                    ...MOCK_DATA,
                    ...res.metadata, // server trả gì thì override vào
                });
            } else {
                setStats(MOCK_DATA);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats(MOCK_DATA);
        } finally {
            setIsLoading(false);
        }
    };

    return { stats, isLoading, fetchStats };
}
