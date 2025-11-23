import classNames from 'classnames/bind';
import styles from '../HomeAdmin.module.scss';
import { Card, Table, Typography, Badge } from 'antd';

const cx = classNames.bind(styles);
const { Text } = Typography;

const getStatusBadge = (status) => {
    const map = {
        pending: { status: 'warning', text: 'Chờ xử lý' },
        completed: { status: 'success', text: 'Hoàn thành' },
        shipping: { status: 'processing', text: 'Đang giao' },
        delivered: { status: 'success', text: 'Đã giao' },
        cancelled: { status: 'error', text: 'Đã hủy' },
    };

    const cfg = map[status] || { status: 'default', text: status };
    return <Badge status={cfg.status} text={cfg.text} />;
};

function RecentOrdersTable({ stats, isLoading }) {
    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'order',
            key: 'order',
            render: (text) => <span style={{ fontWeight: 500, color: '#1890ff' }}>{text}</span>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: 'customer',
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
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
            render: (amount) => <span style={{ color: '#52c41a', fontWeight: 500 }}>{amount?.toLocaleString()}đ</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusBadge(status),
        },
    ];

    return (
        <Card
            title={
                <Text strong style={{ fontSize: 16 }}>
                    Đơn hàng gần đây
                </Text>
            }
            className={cx('recent-orders')}
            hoverable
            loading={isLoading}
            bordered={false}
            style={{
                borderRadius: 12,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
            }}
        >
            <Table
                columns={columns}
                dataSource={stats.recentOrders || []}
                pagination={{ pageSize: 5, size: 'small' }}
                className={cx('orders-table')}
                size="middle"
                rowKey="key"
            />
        </Card>
    );
}

export default RecentOrdersTable;
