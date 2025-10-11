import { Modal, Typography, Descriptions, Table, Image, Tag, Divider } from 'antd';
import classNames from 'classnames/bind';
import styles from '../InfoUser.module.scss';
import { formatCurrency } from '../../../utils/helpers';

const { Title, Text } = Typography;
const cx = classNames.bind(styles);

function OrderDetailModal({ visible, onClose, orderData }) {
    if (!orderData) return null;

    const statusMapping = {
        pending: { text: 'Đang xác nhận', color: 'gold' },
        completed: { text: 'Đã xác nhận', color: 'blue' },
        shipping: { text: 'Đang giao', color: 'purple' },
        delivered: { text: 'Đã giao', color: 'green' },
        cancelled: { text: 'Hủy', color: 'red' },
    };

    const orderStatus = statusMapping[orderData.statusOrder] || { text: 'Không xác định', color: 'default' };

    const productColumns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (image) => <Image src={image} alt="product" width={80} />,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => formatCurrency(price),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Thành tiền',
            key: 'total',
            render: (text, record) => formatCurrency(record.price * record.quantity),
        },
    ];

    // Format date
    const orderDate = new Date(orderData.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // Calculate total amount
    const totalAmount = orderData.products.reduce((total, product) => {
        return total + product.price * product.quantity;
    }, 0);

    return (
        <Modal
            title={<Title level={4}>Chi Tiết Đơn Hàng #{orderData.orderId.slice(-6)}</Title>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            className={cx('order-detail-modal')}
        >
            <div className={cx('order-info')}>
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Trạng thái đơn hàng">
                        <Tag color={orderStatus.color}>{orderStatus.text}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày đặt hàng">{orderDate}</Descriptions.Item>
                    <Descriptions.Item label="Phương thức thanh toán">{orderData.typePayments}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái thanh toán">{orderData.paymentStatus}</Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin người nhận</Divider>
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Tên người nhận">{orderData.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">0{orderData.phone}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ giao hàng">{orderData.address}</Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Sản phẩm đã đặt</Divider>
                <Table dataSource={orderData.products} columns={productColumns} pagination={false} rowKey="productId" />

                <div className={cx('order-summary')}>
                    <div className={cx('total-amount')}>
                        <Text strong>Tổng thanh toán:</Text>
                        <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
                            {formatCurrency(totalAmount)}
                        </Text>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default OrderDetailModal;
