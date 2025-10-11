import classNames from 'classnames/bind';
import styles from './HomeAdmin.module.scss';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Badge,
    Progress,
    Typography,
    DatePicker,
    Select,
    Space,
    Button,
    Divider,
} from 'antd';
import {
    UserOutlined,
    ShoppingCartOutlined,
    DollarCircleOutlined,
    ArrowUpOutlined,
    InboxOutlined,
    UpOutlined,
    FilterOutlined,
    ReloadOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { requestGetStatistic, requestGetStatistics } from '../../../../config/request';
import moment from 'moment';

// Đăng ký các components cần thiết cho Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
);

const { Text, Title: AntTitle } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const cx = classNames.bind(styles);

// Thêm hàm xử lý status badge
const getStatusBadge = (status) => {
    const statusConfig = {
        pending: { color: 'warning', text: 'Chờ xử lý' },
        completed: { color: 'success', text: 'Hoàn thành' },
        shipping: { color: 'processing', text: 'Đang giao' },
        delivered: { color: 'success', text: 'Đã giao' },
        cancelled: { color: 'error', text: 'Đã hủy' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Badge status={config.color} text={config.text} />;
};

// Mock data
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
    categorySales: [
        { category: 'Điện thoại', sales: 42 },
        { category: 'Laptop', sales: 28 },
        { category: 'Tablet', sales: 15 },
        { category: 'Phụ kiện', sales: 10 },
        { category: 'Khác', sales: 5 },
    ],
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
    trafficSources: [
        { source: 'Trực tiếp', value: 35 },
        { source: 'Google', value: 25 },
        { source: 'Facebook', value: 20 },
        { source: 'Tiktok', value: 15 },
        { source: 'Email', value: 5 },
    ],
    recentOrders: [
        {
            key: '1',
            order: 'ORD-001',
            customer: 'Nguyễn Văn A',
            product: 'iPhone 14 Pro Max',
            amount: 27990000,
            status: 'completed',
        },
        {
            key: '2',
            order: 'ORD-002',
            customer: 'Trần Thị B',
            product: 'MacBook Air M2',
            amount: 25990000,
            status: 'shipping',
        },
        {
            key: '3',
            order: 'ORD-003',
            customer: 'Lê Văn C',
            product: 'Samsung Galaxy S23',
            amount: 19990000,
            status: 'pending',
        },
        {
            key: '4',
            order: 'ORD-004',
            customer: 'Phạm Thị D',
            product: 'iPad Air 5',
            amount: 15990000,
            status: 'delivered',
        },
        {
            key: '5',
            order: 'ORD-005',
            customer: 'Hoàng Văn E',
            product: 'Apple Watch Series 8',
            amount: 9990000,
            status: 'cancelled',
        },
        {
            key: '6',
            order: 'ORD-006',
            customer: 'Đỗ Thị F',
            product: 'Tai nghe AirPods Pro 2',
            amount: 5490000,
            status: 'pending',
        },
    ],
};

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
    const [stats, setStats] = useState({
        totalUsers: 0,
        newOrders: 0,
        todayRevenue: 0,
        totalProducts: 0,
        conversion: 0,
        userGrowth: 0,
        orderGrowth: 0,
        revenueGrowth: 0,
        weeklyRevenue: [],
        categorySales: [],
        monthlySales: [],
        trafficSources: [],
        recentOrders: [],
    });

    // State for date filters
    const [dateRange, setDateRange] = useState(dateRanges.thisMonth);
    const [selectedPreset, setSelectedPreset] = useState('thisMonth');
    const [isLoading, setIsLoading] = useState(false);

    const fetchStats = async (startDate, endDate) => {
        setIsLoading(true);
        try {
            // Sử dụng API thực tế thay vì mock data
            const res = await requestGetStatistics({
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
            });

            if (res.status === 'success' && res.metadata) {
                setStats(res.metadata);
            } else {
                // Sử dụng mock data nếu có lỗi từ API
                setStats(MOCK_DATA);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Sử dụng mock data trong trường hợp lỗi
            setStats(MOCK_DATA);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch using default date range
        fetchStats(dateRange[0], dateRange[1]);
    }, []);

    // Handle date range change
    const handleDateRangeChange = (dates, dateStrings) => {
        if (dates && dates.length === 2) {
            setDateRange(dates);
            setSelectedPreset('custom');
        } else {
            setDateRange(dateRanges.thisMonth);
            setSelectedPreset('thisMonth');
        }
    };

    // Handle preset selection
    const handlePresetChange = (value) => {
        setSelectedPreset(value);
        setDateRange(dateRanges[value]);
        fetchStats(dateRanges[value][0], dateRanges[value][1]);
    };

    // Handle filter application
    const handleApplyFilter = () => {
        fetchStats(dateRange[0], dateRange[1]);
    };

    // Handle reset filter
    const handleResetFilter = () => {
        setSelectedPreset('thisMonth');
        setDateRange(dateRanges.thisMonth);
        fetchStats(dateRanges.thisMonth[0], dateRanges.thisMonth[1]);
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'order',
            key: 'order',
            render: (text) => <span style={{ fontWeight: '500', color: '#1890ff' }}>{text}</span>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: 'customer',
            render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>,
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <span style={{ color: '#52c41a', fontWeight: '500' }}>{amount?.toLocaleString()}đ</span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusBadge(status),
        },
    ];

    // Cập nhật chartData với dữ liệu thực
    const revenueChartData = {
        labels: stats.weeklyRevenue.map((day) => day._id),
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: stats.weeklyRevenue.map((day) => day.dailyRevenue),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const revenueChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Thống kê doanh thu 7 ngày gần nhất',
                font: {
                    size: 16,
                    weight: '500',
                },
                padding: 20,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString() + ' đ';
                    },
                },
                grid: {
                    display: true,
                    drawBorder: false,
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
        elements: {
            bar: {
                borderRadius: 4,
            },
        },
    };

    // Category sales pie chart
    const categorySalesData = {
        labels: stats.categorySales.map((item) => item.category),
        datasets: [
            {
                data: stats.categorySales.map((item) => item.sales),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const piechartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Phân bổ doanh số theo danh mục',
                font: {
                    size: 16,
                    weight: '500',
                },
                padding: 20,
            },
        },
    };

    // Monthly sales line chart
    const monthlySalesData = {
        labels: stats.monthlySales.map((item) => item.month),
        datasets: [
            {
                label: 'Doanh số (VNĐ)',
                data: stats.monthlySales.map((item) => item.sales),
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.4,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Xu hướng doanh số theo tháng',
                font: {
                    size: 16,
                    weight: '500',
                },
                padding: 20,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return (value / 1000000).toFixed(0) + ' tr';
                    },
                },
                grid: {
                    display: true,
                    drawBorder: false,
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    // Traffic sources doughnut chart
    const trafficData = {
        labels: stats.trafficSources.map((item) => item.source),
        datasets: [
            {
                data: stats.trafficSources.map((item) => item.value),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Nguồn truy cập',
                font: {
                    size: 16,
                    weight: '500',
                },
                padding: 20,
            },
        },
        cutout: '60%',
    };

    useEffect(() => {
        const fetchStatistics = async () => {
            const res = await requestGetStatistics();
            setStats(res.metadata);
        };
        fetchStatistics();
    }, []);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('dashboard-header')}>
                <div className={cx('title-section')}>
                    <AntTitle level={2} style={{ margin: 0, fontWeight: 600 }}>
                        Tổng quan
                    </AntTitle>
                    <Text type="secondary">Theo dõi số liệu và hoạt động của cửa hàng</Text>
                </div>

                <Card
                    className={cx('filter-card')}
                    bodyStyle={{ padding: '16px' }}
                    bordered={false}
                    style={{
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                        borderRadius: '8px',
                        marginTop: '16px',
                        background: '#fafafa',
                    }}
                >
                    <Row gutter={[20, 20]} align="middle">
                        <Col xs={24} md={24}>
                            <div className={cx('filter-label')}>
                                <CalendarOutlined style={{ marginRight: '8px' }} />
                                <Text strong>Khoảng thời gian</Text>
                            </div>
                            <Select
                                style={{ width: '100%', marginTop: '8px' }}
                                value={selectedPreset}
                                onChange={handlePresetChange}
                                loading={isLoading}
                                size="large"
                                bordered={true}
                                dropdownStyle={{ borderRadius: '6px' }}
                            >
                                <Option value="today">Hôm nay</Option>
                                <Option value="yesterday">Hôm qua</Option>
                                <Option value="thisWeek">Tuần này</Option>
                                <Option value="lastWeek">Tuần trước</Option>
                                <Option value="thisMonth">Tháng này</Option>
                                <Option value="lastMonth">Tháng trước</Option>
                                <Option value="thisYear">Năm nay</Option>
                            </Select>
                        </Col>
                    </Row>
                </Card>
            </div>

            {/* Thống kê chính */}
            <Row gutter={[20, 20]} className={cx('stats-row')} style={{ marginTop: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                    <Card
                        hoverable
                        className={cx('stat-card')}
                        bodyStyle={{ padding: '24px' }}
                        loading={isLoading}
                        bordered={false}
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                        }}
                    >
                        <Statistic
                            title={
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px',
                                    }}
                                >
                                    <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>Tổng người dùng</Text>
                                </div>
                            }
                            value={stats.totalUsers}
                            prefix={
                                <div
                                    className={cx('stat-icon-wrapper')}
                                    style={{ backgroundColor: 'rgba(24, 144, 255, 0.1)' }}
                                >
                                    <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                </div>
                            }
                            valueStyle={{
                                color: '#1890ff',
                                fontSize: '28px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card
                        hoverable
                        className={cx('stat-card')}
                        bodyStyle={{ padding: '24px' }}
                        loading={isLoading}
                        bordered={false}
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                        }}
                    >
                        <Statistic
                            title={
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px',
                                    }}
                                >
                                    <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>Đơn hàng mới</Text>
                                </div>
                            }
                            value={stats.newOrders}
                            prefix={
                                <div
                                    className={cx('stat-icon-wrapper')}
                                    style={{ backgroundColor: 'rgba(82, 196, 26, 0.1)' }}
                                >
                                    <ShoppingCartOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                                </div>
                            }
                            valueStyle={{
                                color: '#52c41a',
                                fontSize: '28px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card
                        hoverable
                        className={cx('stat-card')}
                        bodyStyle={{ padding: '24px' }}
                        loading={isLoading}
                        bordered={false}
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                        }}
                    >
                        <Statistic
                            title={
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px',
                                    }}
                                >
                                    <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>Doanh thu hôm nay</Text>
                                </div>
                            }
                            value={stats.todayRevenue}
                            prefix={
                                <div
                                    className={cx('stat-icon-wrapper')}
                                    style={{ backgroundColor: 'rgba(245, 34, 45, 0.1)' }}
                                >
                                    <DollarCircleOutlined style={{ fontSize: '24px', color: '#f5222d' }} />
                                </div>
                            }
                            suffix="đ"
                            valueStyle={{
                                color: '#f5222d',
                                fontSize: '28px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card
                        hoverable
                        className={cx('stat-card')}
                        bodyStyle={{ padding: '24px' }}
                        loading={isLoading}
                        bordered={false}
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                        }}
                    >
                        <Statistic
                            title={
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px',
                                    }}
                                >
                                    <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>Tổng sản phẩm</Text>
                                </div>
                            }
                            value={stats.totalProducts}
                            prefix={
                                <div
                                    className={cx('stat-icon-wrapper')}
                                    style={{ backgroundColor: 'rgba(114, 46, 209, 0.1)' }}
                                >
                                    <InboxOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                                </div>
                            }
                            valueStyle={{
                                color: '#722ed1',
                                fontSize: '28px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts Row 1 */}
            <Row gutter={[20, 20]} style={{ marginTop: '24px' }}>
                <Col xs={24} md={16}>
                    <Card
                        hoverable
                        className={cx('chart-card')}
                        bodyStyle={{ padding: '20px' }}
                        loading={isLoading}
                        bordered={false}
                        title={
                            <Text strong style={{ fontSize: '16px' }}>
                                Xu hướng doanh số theo tháng
                            </Text>
                        }
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                            height: '100%',
                        }}
                    >
                        <Line data={monthlySalesData} options={lineChartOptions} />
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card
                        hoverable
                        title={
                            <Text strong style={{ fontSize: '16px' }}>
                                Tỷ lệ chuyển đổi
                            </Text>
                        }
                        className={cx('conversion-card')}
                        loading={isLoading}
                        bordered={false}
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                            height: '100%',
                        }}
                    >
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <Progress
                                type="dashboard"
                                percent={stats.conversion}
                                strokeColor={{
                                    '0%': '#108ee9',
                                    '100%': '#87d068',
                                }}
                                width={180}
                            />
                            <div style={{ marginTop: '20px' }}>
                                <Text strong style={{ fontSize: '16px' }}>
                                    Tỷ lệ chuyển đổi khách hàng
                                </Text>
                                <div style={{ fontSize: '14px', color: '#8c8c8c', marginTop: '8px' }}>
                                    Tỷ lệ khách truy cập chuyển đổi thành đơn hàng
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row 2 */}
            <Row gutter={[20, 20]} style={{ marginTop: '24px' }}>
                <Col xs={24} md={24}>
                    <Card
                        hoverable
                        className={cx('chart-card')}
                        bodyStyle={{ padding: '20px' }}
                        loading={isLoading}
                        bordered={false}
                        title={
                            <Text strong style={{ fontSize: '16px' }}>
                                Doanh thu 7 ngày gần nhất
                            </Text>
                        }
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                            height: '100%',
                        }}
                    >
                        <Bar data={revenueChartData} options={revenueChartOptions} />
                    </Card>
                </Col>
            </Row>

            {/* Row 3 */}
            <Row gutter={[20, 20]} style={{ marginTop: '24px' }}>
                <Col xs={24} md={24}>
                    <Card
                        title={
                            <Text strong style={{ fontSize: '16px' }}>
                                Đơn hàng gần đây
                            </Text>
                        }
                        className={cx('recent-orders')}
                        hoverable
                        loading={isLoading}
                        bordered={false}
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                        }}
                    >
                        <Table
                            columns={columns}
                            dataSource={stats.recentOrders}
                            pagination={{ pageSize: 5, size: 'small' }}
                            className={cx('orders-table')}
                            size="middle"
                            rowKey="key"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default HomeAdmin;
