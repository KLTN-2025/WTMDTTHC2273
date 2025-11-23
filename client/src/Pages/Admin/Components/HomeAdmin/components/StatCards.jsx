import classNames from 'classnames/bind';
import styles from '../HomeAdmin.module.scss';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarCircleOutlined, InboxOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);
const { Text } = Typography;

const STAT_ITEMS = [
    {
        key: 'totalUsers',
        label: 'Tổng người dùng',
        icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
        color: '#1890ff',
    },
    {
        key: 'newOrders',
        label: 'Đơn hàng mới',
        icon: <ShoppingCartOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
        color: '#52c41a',
    },
    {
        key: 'todayRevenue',
        label: 'Doanh thu hôm nay',
        icon: <DollarCircleOutlined style={{ fontSize: 24, color: '#f5222d' }} />,
        color: '#f5222d',
        suffix: 'đ',
    },
    {
        key: 'totalProducts',
        label: 'Tổng sản phẩm',
        icon: <InboxOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
        color: '#722ed1',
    },
];

function StatCards({ stats, isLoading }) {
    return (
        <Row gutter={[20, 20]} className={cx('stats-row')} style={{ marginTop: 24 }}>
            {STAT_ITEMS.map((item) => (
                <Col xs={24} sm={12} md={6} key={item.key}>
                    <Card
                        hoverable
                        className={cx('stat-card')}
                        bodyStyle={{ padding: 24 }}
                        loading={isLoading}
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                        }}
                    >
                        <Statistic
                            title={<Text style={{ fontSize: 16, color: '#8c8c8c' }}>{item.label}</Text>}
                            value={stats?.[item.key] || 0}
                            prefix={item.icon}
                            suffix={item.suffix}
                            valueStyle={{
                                color: item.color,
                                fontSize: 28,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                            }}
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

export default StatCards;
