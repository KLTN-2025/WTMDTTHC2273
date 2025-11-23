import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './HomeAdmin.module.scss';
import { Row, Col, Typography } from 'antd';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js';
import moment from 'moment';

import useStatistics from './hooks/useStatistics';
import DashboardHeader from './components/DashboardHeader';
import StatCards from './components/StatCards';
import MonthlySalesChart from './components/Charts/MonthlySalesChart';
import WeeklyRevenueChart from './components/Charts/WeeklyRevenueChart';
import ConversionChart from './components/Charts/ConversionChart';
import RecentOrdersTable from './components/RecentOrdersTable';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, Filler);

const cx = classNames.bind(styles);
const { Text } = Typography;

// Preset date ranges
const dateRanges = {
    today: [moment().startOf('day'), moment().endOf('day')],
    yesterday: [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
    thisWeek: [moment().startOf('week'), moment().endOf('week')],
    lastWeek: [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
    thisMonth: [moment().startOf('month'), moment().endOf('month')],
    lastMonth: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    thisYear: [moment().startOf('year'), moment().endOf('year')],
};

function HomeAdmin() {
    const [dateRange, setDateRange] = useState(dateRanges.thisMonth);
    const [selectedPreset, setSelectedPreset] = useState('thisMonth');

    const { stats, isLoading, fetchStats } = useStatistics();

    // Lần đầu load
    useEffect(() => {
        fetchStats({
            startDate: dateRanges.thisMonth[0],
            endDate: dateRanges.thisMonth[1],
        });
    }, []);

    // Khi chọn preset nhanh (Hôm nay / Tuần này / …)
    const handlePresetChange = (presetKey) => {
        const range = dateRanges[presetKey];
        setSelectedPreset(presetKey);
        setDateRange(range);
        fetchStats({ startDate: range[0], endDate: range[1] });
    };

    // Khi chọn date range custom
    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            setDateRange(dates);
            setSelectedPreset('custom');
        } else {
            setDateRange(dateRanges.thisMonth);
            setSelectedPreset('thisMonth');
        }
    };

    // Nút “Áp dụng”
    const handleApplyFilter = () => {
        fetchStats({ startDate: dateRange[0], endDate: dateRange[1] });
    };

    // Nút “Đặt lại”
    const handleResetFilter = () => {
        setSelectedPreset('thisMonth');
        setDateRange(dateRanges.thisMonth);
        fetchStats({ startDate: dateRanges.thisMonth[0], endDate: dateRanges.thisMonth[1] });
    };

    return (
        <div className={cx('wrapper')}>
            <DashboardHeader
                selectedPreset={selectedPreset}
                dateRange={dateRange}
                isLoading={isLoading}
                onPresetChange={handlePresetChange}
                onDateRangeChange={handleDateRangeChange}
                onApplyFilter={handleApplyFilter}
                onResetFilter={handleResetFilter}
            />

            {/* Cards thống kê chính */}
            <StatCards stats={stats} isLoading={isLoading} />

            {/* Charts row 1: Line + Conversion */}
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
                <Col xs={24} md={16}>
                    <MonthlySalesChart stats={stats} isLoading={isLoading} />
                </Col>
                <Col xs={24} md={8}>
                    <ConversionChart stats={stats} isLoading={isLoading} />
                </Col>
            </Row>

            {/* Charts row 2: Bar weekly revenue */}
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
                <Col xs={24}>
                    <WeeklyRevenueChart stats={stats} isLoading={isLoading} />
                </Col>
            </Row>

            {/* Recent orders */}
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
                <Col xs={24}>
                    <RecentOrdersTable stats={stats} isLoading={isLoading} />
                </Col>
            </Row>
        </div>
    );
}

export default HomeAdmin;
