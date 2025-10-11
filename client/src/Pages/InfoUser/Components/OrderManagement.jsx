import { Typography, Table, Button, message } from 'antd';
import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../InfoUser.module.scss';
import { requestGetPayment, requestUpdateStatusOrder, requestSubmitProductReview } from '../../../config/request';
import { StarOutlined, EyeOutlined } from '@ant-design/icons';
import OrderDetailModal from './OrderDetailModal';
import ProductReviewModal from './ProductReviewModal';

const { Title } = Typography;
const cx = classNames.bind(styles);

function OrderManagement() {
    const [dataOrder, setDataOrder] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderModalVisible, setOrderModalVisible] = useState(false);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const statusMapping = {
        pending: 'Đang xác nhận',
        completed: 'Đã xác nhận',
        shipping: 'Đang giao',
        delivered: 'Đã giao',
        cancelled: 'Hủy',
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await requestGetPayment();
            setDataOrder(res.metadata.orders);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            const res = await requestUpdateStatusOrder({ statusOrder: 'cancelled', orderId });
            message.success('Huỷ đơn hàng thành công');
            fetchOrders();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleViewOrder = (orderId) => {
        const order = dataOrder.find((item) => item.orderId === orderId);
        setSelectedOrder(order);
        setOrderModalVisible(true);
    };

    const handleReviewOrder = (orderId) => {
        const order = dataOrder.find((item) => item.orderId === orderId);
        setSelectedOrder(order);
        setReviewModalVisible(true);
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            setSubmitting(true);
            // In a real application, we would use the actual API
            await requestSubmitProductReview(reviewData);
            message.success('Đánh giá sản phẩm thành công!');
            setReviewModalVisible(false);
            return Promise.resolve();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
            return Promise.reject(error);
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: 'ID Đơn Hàng',
            dataIndex: 'orderId',
            key: 'orderId',
            render: (orderId) => orderId.slice(-6),
        },
        {
            title: 'Người Nhận',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Số Điện Thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => `0${phone}`,
        },
        {
            title: 'Địa Chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
        },
        {
            title: 'Trạng Thái Thanh Toán',
            dataIndex: 'typePayments',
            key: 'typePayments',
        },
        {
            title: 'Trạng Thái Đơn Hàng',
            dataIndex: 'statusOrder',
            key: 'statusOrder',
            render: (status) => statusMapping[status] || 'Không xác định',
        },
        {
            title: 'Sản Phẩm',
            dataIndex: 'products',
            key: 'products',
            render: (products) => (
                <ul className={cx('product-list')}>
                    {products.map((product) => (
                        <li key={product.productId}>
                            {product.name} - SL: {product.quantity}
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            title: 'Thao tác',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewOrder(record.orderId)}
                        style={{ marginRight: 8 }}
                    >
                        Xem chi tiết
                    </Button>

                    {record.statusOrder === 'pending' && (
                        <Button
                            type="primary"
                            danger
                            onClick={() => handleCancelOrder(record.orderId)}
                            style={{ marginRight: 8 }}
                        >
                            Huỷ đơn hàng
                        </Button>
                    )}

                    {record.statusOrder === 'delivered' && record.previewProduct.length === 0 && (
                        <Button
                            type="default"
                            icon={<StarOutlined />}
                            onClick={() => handleReviewOrder(record.orderId)}
                            style={{
                                borderColor: '#fadb14',
                                color: '#fadb14',
                                fontWeight: '500',
                            }}
                        >
                            Đánh giá
                        </Button>
                    )}
                </>
            ),
        },
    ];

    return (
        <div className={cx('orders-content')}>
            <Title level={4}>Quản Lý Đơn Hàng</Title>
            <Table
                dataSource={dataOrder}
                columns={columns}
                rowKey="orderId"
                className={cx('orders-table')}
                scroll={{ x: 1200 }}
            />

            <OrderDetailModal
                visible={orderModalVisible}
                onClose={() => setOrderModalVisible(false)}
                orderData={selectedOrder}
            />

            <ProductReviewModal
                visible={reviewModalVisible}
                onClose={() => setReviewModalVisible(false)}
                orderData={selectedOrder}
                onSubmitReview={handleSubmitReview}
                submitting={submitting}
                fetchOrders={fetchOrders}
            />
        </div>
    );
}

export default OrderManagement;
