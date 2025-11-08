import classNames from 'classnames/bind';
import styles from './Cart.module.scss';

import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import cartEmpty from '../../assets/images/cart_empty.webp';
import { requestDeleteProductCart, requestUpdateQuantityCart } from '../../config/request';

import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import toast, { Toaster } from 'react-hot-toast';
import { useStore } from '../../hooks/useStore';
import { useState } from 'react';

const cx = classNames.bind(styles);

function CartUser() {
    const { dataUser, dataCart, fetchCart } = useStore();
    const [quantityMap, setQuantityMap] = useState({});

    // Cập nhật số lượng hiển thị tạm trên input
    const handleQuantityChange = (idProduct, value) => {
        // Cho phép xóa tạm khi người dùng đang gõ
        if (value === '') {
            setQuantityMap((prev) => ({ ...prev, [idProduct]: '' }));
            return;
        }

        const parsedValue = parseInt(value, 10);

        // Nếu người dùng nhập ký tự không hợp lệ
        if (isNaN(parsedValue)) return;

        // Luôn đảm bảo tối thiểu là 1
        const newValue = Math.max(1, parsedValue);

        setQuantityMap((prev) => ({ ...prev, [idProduct]: newValue }));
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        try {
            if (newQuantity < 1) {
                toast.error('Số lượng tối thiểu là 1');
                return;
            }
            const userId = dataUser?._id || JSON.parse(localStorage.getItem('user'))?._id;

            const body = {
                userId,
                productId,
                quantity: newQuantity,
            };

            const res = await requestUpdateQuantityCart(body);

            toast.success(res.message || 'Cập nhật giỏ hàng thành công');
            await fetchCart();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật giỏ hàng');
        }
    };

    const handleDeleteProductCart = async (idProduct) => {
        try {
            const res = await requestDeleteProductCart(idProduct);
            toast.success(res.message || 'Đã xóa sản phẩm khỏi giỏ hàng');
            await fetchCart();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xóa sản phẩm thất bại');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <Toaster />
            <header>
                <Header />
            </header>

            {dataCart?.data?.length === 0 ? (
                <div className={cx('cart-empty')}>
                    <img src={cartEmpty} alt="" />
                    <h4>Hổng có gì trong giỏ hết</h4>
                    <p>Về trang cửa hàng để chọn mua sản phẩm bạn nhé!</p>
                    <Link to={'/category'}>
                        <Button variant="contained">Mua sắm ngay</Button>
                    </Link>
                </div>
            ) : (
                <div className={cx('inner')}>
                    <div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">Tên Sản Phẩm</th>
                                    <th scope="col">Ảnh sản phẩm</th>
                                    <th scope="col">Giá</th>
                                    <th scope="col">Số Lượng</th>
                                    <th scope="col">Tổng</th>
                                    <th scope="col">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataCart?.data?.map((item) => {
                                    const currentQuantity = quantityMap[item._id] ?? item.quantity;

                                    return (
                                        <tr key={item._id}>
                                            <td>{item.name}</td>
                                            <td>
                                                <img
                                                    style={{
                                                        width: '100px',
                                                        height: '100px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                    }}
                                                    src={item.images[0]}
                                                    alt=""
                                                />
                                            </td>
                                            <td>{item.price?.toLocaleString()} VNĐ</td>

                                            {/* Phần tăng giảm giống DetailProduct */}
                                            <td>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                    }}
                                                >
                                                    <button
                                                        className={cx('quantity-btn')}
                                                        onClick={() => {
                                                            const newQty = currentQuantity - 1;
                                                            handleQuantityChange(item._id, newQty);
                                                            handleUpdateQuantity(item._id, newQty);
                                                        }}
                                                    >
                                                        -
                                                    </button>

                                                    <input
                                                        type="number"
                                                        value={currentQuantity}
                                                        onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                                                        onBlur={() => handleUpdateQuantity(item._id, currentQuantity)}
                                                        min="1"
                                                        className={cx('quantity-input')}
                                                    />

                                                    <button
                                                        className={cx('quantity-btn')}
                                                        onClick={() => {
                                                            const newQty = currentQuantity + 1;
                                                            handleQuantityChange(item._id, newQty);
                                                            handleUpdateQuantity(item._id, newQty);
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>

                                            <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                                            <td>
                                                <button
                                                    onClick={() => handleDeleteProductCart(item._id)}
                                                    type="button"
                                                    className="btn btn-danger"
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                <tr>
                                    <td colSpan="4" className="text-end fw-bold">
                                        Tạm Tính
                                    </td>
                                    <td className="fw-bold text-danger">
                                        {dataCart?.totalPrice?.toLocaleString()} VNĐ
                                    </td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className={cx('btn-cart')}>
                        <Link to="/category">
                            <button>Tiếp tục mua sắm</button>
                        </Link>
                        <Link to="/checkout">
                            <button>Tiến hành thanh toán</button>
                        </Link>
                    </div>
                </div>
            )}

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default CartUser;
