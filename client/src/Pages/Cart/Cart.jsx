import classNames from 'classnames/bind';
import styles from './Cart.module.scss';

import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import cartEmpty from '../../assets/images/cart_empty.webp';
import { requestDeleteProductCart } from '../../config/request';

import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';

import toast, { Toaster } from 'react-hot-toast';
import { useStore } from '../../hooks/useStore';

const cx = classNames.bind(styles);

function CartUser() {
    const { dataCart, fetchCart } = useStore();

    const handleDeleteProductCart = async (idProduct) => {
        try {
            const res = await requestDeleteProductCart(idProduct);
            toast.success(res.message);
            fetchCart();
        } catch (error) {
            toast.error(error.response.data.message);
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
                    <h4>“Hổng” có gì trong giỏ hết</h4>
                    <p>Về trang cửa hàng để chọn mua sản phẩm bạn nhé!!</p>
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
                                {dataCart?.data?.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>
                                            <img
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                src={item.images[0]}
                                                alt=""
                                            />
                                        </td>
                                        <td>{item?.price?.toLocaleString()} VNĐ</td>
                                        <td>{item?.quantity} sản phẩm</td>
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
                                ))}
                                <tr>
                                    <td colSpan="3">Tạm Tính</td>
                                    <td></td>
                                    <td>{dataCart?.totalPrice?.toLocaleString()} VNĐ</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className={cx('btn-cart')}>
                        <Link to="/category">
                            <button>Tiêp tục mua sắm</button>
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
