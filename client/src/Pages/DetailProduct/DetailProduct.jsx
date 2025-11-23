import classNames from 'classnames/bind';
import styles from './DetailProduct.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { requestAddCart, requestGetOneProduct } from '../../config/request';
import { Rate } from 'antd';
import toast, { Toaster } from 'react-hot-toast';
import { useStore } from '../../hooks/useStore';

const cx = classNames.bind(styles);

function DetailProduct() {
    const { id } = useParams();
    const [dataProduct, setDataProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [dataCoupon, setDataCoupon] = useState([]);
    const [dataPreviewProduct, setDataPreviewProduct] = useState([]);

    const { fetchCart } = useStore();
    const ref = useRef();

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestGetOneProduct(id);
            const { product, dataCoupon, dataPreivew } = res.metadata;

            setDataCoupon(dataCoupon);
            setDataProduct(product);
            setDataPreviewProduct(dataPreivew);

            ref.current.scrollIntoView({ behavior: 'smooth' });
            setSelectedImage(product.images?.[0] || '');
        };
        fetchData();
    }, [id]);

    if (!dataProduct) return <div>Loading...</div>;

    const handleThumbnailClick = (image) => {
        setSelectedImage(image);
    };

    const handleIncrease = () => {
        if (quantity < dataProduct.stock) {
            setQuantity(quantity + 1);
        }
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleQuantityChange = (e) => {
        const value = Math.max(1, Math.min(dataProduct.stock, Number(e.target.value)));
        setQuantity(value);
    };

    const handleAddCart = async () => {
        if (quantity > dataProduct.stock) {
            toast.error('Số lượng trong kho không đủ');
            return;
        }

        const data = {
            productId: dataProduct._id,
            quantity,
        };

        try {
            const res = await requestAddCart(data);
            toast.success(res.message);
            await fetchCart();
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    };

    const onCoppyCoupon = (coupon) => {
        navigator.clipboard.writeText(coupon);
        toast.success('Mã giảm giá đã được sao chép');
    };

    const renderAttributes = () => (
        <div className={cx('attributes')}>
            <p>Thương hiệu: {dataProduct.brand || 'Không có'}</p>
            {dataProduct.size && <p>Kích thước: {dataProduct.size}</p>}
            {dataProduct.color && <p>Màu sắc: {dataProduct.color}</p>}
            {dataProduct.material && <p>Chất liệu: {dataProduct.material}</p>}
            <p>Số lượng còn: {dataProduct.stock} sản phẩm</p>
        </div>
    );

    return (
        <div className={cx('wrapper')} ref={ref}>
            <Toaster />
            <header>
                <Header />
            </header>

            <div className={cx('main')}>
                <div className={cx('product-container')}>
                    <div className={cx('image-section')}>
                        <img src={selectedImage} alt={dataProduct.name} className={cx('main-image')} />
                        <div className={cx('thumbnail-gallery')}>
                            {dataProduct.images?.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`${dataProduct.name} - ${index}`}
                                    className={cx('thumbnail', { active: img === selectedImage })}
                                    onClick={() => handleThumbnailClick(img)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={cx('info-section')}>
                        <h1 className={cx('product-title')}>{dataProduct.name}</h1>
                        <p className={cx('price')}>
                            Giá:{' '}
                            {dataProduct.price?.toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            })}
                        </p>

                        {renderAttributes()}

                        <div className={cx('color-options')}>
                            <h3>Mã giảm giá</h3>
                            {dataCoupon.length > 0 ? (
                                dataCoupon.map((item) => (
                                    <button
                                        key={item._id}
                                        onClick={() => onCoppyCoupon(item.nameCoupon)}
                                        className={cx('color-btn')}
                                    >
                                        {item.nameCoupon} - Giảm {item.discount?.toLocaleString()}đ
                                    </button>
                                ))
                            ) : (
                                <p>Không có mã giảm giá phù hợp</p>
                            )}
                        </div>

                        <div className={cx('quantity-section')}>
                            <button className={cx('quantity-btn')} onClick={handleDecrease}>
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className={cx('quantity-input')}
                                min="1"
                                max={dataProduct.stock}
                            />
                            <button className={cx('quantity-btn')} onClick={handleIncrease}>
                                +
                            </button>
                        </div>

                        <button onClick={handleAddCart} className={cx('buy-button')}>
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>

                <div className={cx('description-section')}>
                    <h2>Mô tả sản phẩm</h2>
                    <div
                        className={cx('description-content')}
                        dangerouslySetInnerHTML={{ __html: dataProduct.description }}
                    />
                </div>

                <div className={cx('review-section')}>
                    <h2>Đánh giá sản phẩm</h2>
                    <div className={cx('review-content')}>
                        {dataPreviewProduct.length > 0 ? (
                            dataPreviewProduct.map((review) => (
                                <div key={review._id} className={cx('review-item')}>
                                    <div className={cx('review-header')}>
                                        <div className={cx('user-info')}>
                                            <strong>{review.user.fullName}</strong>
                                            <span className={cx('review-date')}>
                                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className={cx('rating')}>
                                            <Rate disabled defaultValue={review.rating} />
                                        </div>
                                    </div>
                                    <div className={cx('review-body')}>
                                        <p>{review.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Chưa có đánh giá nào cho sản phẩm này</p>
                        )}
                    </div>
                </div>
            </div>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default DetailProduct;
