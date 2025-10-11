import classNames from 'classnames/bind';
import styles from './CardBody.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function CardBody({ item }) {
    return (
        <div className={cx('wrapper')}>
            <Link to={`/product/${item._id}`}>
                <img src={item.images[0]} alt="" />
            </Link>
            <div>
                <h4>{item.name}</h4>
                <p>Giá : {item.price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}</p>
                {item.attributes.brand ? (
                    <p>Thương hiệu : {item?.attributes?.brand}</p>
                ) : (
                    <p> Mùi hương : {item?.attributes?.scent}</p>
                )}
                <p>Số lượng còn : {item.stock} sản phẩm</p>
            </div>
        </div>
    );
}

export default CardBody;
