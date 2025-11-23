import classNames from 'classnames/bind';
import styles from './CardBody.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function CardBody({ item }) {
    return (
        <div className={cx('wrapper')}>
            <Link to={`/product/${item._id}`} className={cx('imageWrapper')}>
                <img src={item.images[0]} alt={item.name} />
            </Link>

            <div className={cx('info')}>
                <h4>{item.name}</h4>
                <p className={cx('price')}>
                    Giá: {item.price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}
                </p>
                {item.brand ? (
                    <p className={cx('brand')}>Thương hiệu: {item.brand}</p>
                ) : (
                    <p className={cx('brand')}>Mùi hương: {item.scent}</p>
                )}
                <p className={cx('stock')}>Số lượng còn: {item.stock} sản phẩm</p>
            </div>
        </div>
    );
}

export default CardBody;
