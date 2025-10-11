import { useState } from 'react';
import { Modal, Typography, Rate, Input, Button, Form, message, Card, Row, Col, Image, Spin } from 'antd';
import classNames from 'classnames/bind';
import styles from '../InfoUser.module.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;
const cx = classNames.bind(styles);

function ProductReviewModal({ visible, onClose, orderData, onSubmitReview, submitting = false, fetchOrders }) {
    const [form] = Form.useForm();
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        form.setFieldsValue({
            productId: product.productId,
            rating: 5,
            content: '',
        });
    };

    const handleSubmitReview = async (values) => {
        try {
            // In a real implementation, we would call the API here
            await onSubmitReview({
                ...values,
                productId: selectedProduct.productId,
            });

            setSelectedProduct(null);
            form.resetFields();
            fetchOrders();
        } catch (error) {
            console.error(error);
        }
    };

    const handleClose = () => {
        setSelectedProduct(null);
        form.resetFields();
        onClose();
    };

    if (!orderData || !orderData.products || orderData.products.length === 0) {
        return null;
    }

    return (
        <Modal
            title={<Title level={4}>Đánh Giá Sản Phẩm</Title>}
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={800}
            className={cx('review-modal')}
            destroyOnClose
        >
            <Spin spinning={submitting} tip="Đang gửi đánh giá...">
                {!selectedProduct ? (
                    <div className={cx('product-selection')}>
                        <Text className={cx('selection-instruction')}>Vui lòng chọn sản phẩm bạn muốn đánh giá:</Text>
                        <Row gutter={[16, 16]} className={cx('product-grid')}>
                            {orderData.products.map((product) => (
                                <Col xs={24} sm={12} md={8} key={product.productId}>
                                    <Card
                                        hoverable
                                        className={cx('product-card')}
                                        onClick={() => handleSelectProduct(product)}
                                    >
                                        <div className={cx('product-image')}>
                                            <Image src={product.image} alt={product.name} preview={false} />
                                        </div>
                                        <div className={cx('product-info')}>
                                            <Text strong ellipsis={{ tooltip: product.name }}>
                                                {product.name}
                                            </Text>
                                            <Text type="secondary">Số lượng: {product.quantity}</Text>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ) : (
                    <div className={cx('review-form-container')}>
                        <div className={cx('selected-product')}>
                            <Image src={selectedProduct.image} alt={selectedProduct.name} width={100} preview={false} />
                            <div>
                                <Text strong>{selectedProduct.name}</Text>
                            </div>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmitReview}
                            initialValues={{
                                productId: selectedProduct.productId,
                                rating: 5,
                                content: '',
                            }}
                        >
                            <Form.Item
                                name="rating"
                                label="Đánh giá của bạn"
                                rules={[{ required: true, message: 'Vui lòng đánh giá sản phẩm!' }]}
                            >
                                <Rate allowHalf />
                            </Form.Item>

                            <Form.Item
                                name="content"
                                label="Nhận xét của bạn"
                                rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
                            >
                                <TextArea rows={4} placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này..." />
                            </Form.Item>

                            <Form.Item className={cx('review-form-actions')}>
                                <Button
                                    onClick={() => setSelectedProduct(null)}
                                    style={{ marginRight: 8 }}
                                    disabled={submitting}
                                >
                                    Quay lại
                                </Button>
                                <Button type="primary" htmlType="submit" loading={submitting}>
                                    Gửi đánh giá
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Spin>
        </Modal>
    );
}

export default ProductReviewModal;
