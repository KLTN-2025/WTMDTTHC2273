import { Typography, Card, Rate, Image, Empty, Row, Col, Tag, Spin, Divider } from 'antd';
import classNames from 'classnames/bind';
import styles from '../InfoUser.module.scss';
import { useEffect, useState } from 'react';
import { requestGetPreviewProduct } from '../../../config/request';
import { formatCurrency } from '../../../utils/helpers';

const { Title, Text, Paragraph } = Typography;
const cx = classNames.bind(styles);

function ReviewManagement() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const res = await requestGetPreviewProduct();
                setReviews(res.metadata || []);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    return (
        <div className={cx('reviews-content')}>
            <Title level={4}>Quản Lý Đánh Giá</Title>

            <Spin spinning={loading} tip="Đang tải đánh giá...">
                {reviews.length > 0 ? (
                    <div className={cx('reviews-list')}>
                        <Row gutter={[16, 16]}>
                            {reviews.map((review) => (
                                <Col xs={24} md={12} lg={7} key={review._id}>
                                    <Card
                                        hoverable
                                        className={cx('review-card')}
                                        cover={
                                            <div className={cx('review-product-image')}>
                                                <Image
                                                    src={review.product?.images?.[0]}
                                                    alt={review.product?.name}
                                                    style={{ width: '200px', height: '200px' }}
                                                    preview={false}
                                                />
                                            </div>
                                        }
                                    >
                                        <div className={cx('review-product-info')}>
                                            <Text strong ellipsis={{ tooltip: review.product?.name }}>
                                                {review.product?.name}
                                            </Text>
                                            <Text type="secondary">{formatCurrency(review.product?.price)}</Text>

                                            <div className={cx('review-product-attributes')}>
                                                {review.product?.attributes?.size && (
                                                    <Tag color="blue">Size: {review.product.attributes.size}</Tag>
                                                )}
                                                {review.product?.attributes?.color && (
                                                    <Tag color="magenta">Màu: {review.product.attributes.color}</Tag>
                                                )}
                                                {review.product?.attributes?.brand && (
                                                    <Tag color="purple">
                                                        Thương hiệu: {review.product.attributes.brand}
                                                    </Tag>
                                                )}
                                            </div>
                                        </div>

                                        <Divider />

                                        <div className={cx('review-content')}>
                                            <div className={cx('review-rating')}>
                                                <Rate disabled defaultValue={review.rating} />
                                                <Text type="secondary" className={cx('review-date')}>
                                                    {formatDate(review.createdAt)}
                                                </Text>
                                            </div>

                                            <Paragraph className={cx('review-text')}>
                                                Nội dung : {review.content}
                                            </Paragraph>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ) : (
                    !loading && <Empty description="Bạn chưa có đánh giá nào" className={cx('no-review')} />
                )}
            </Spin>
        </div>
    );
}

export default ReviewManagement;
