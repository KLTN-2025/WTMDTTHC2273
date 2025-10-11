import classNames from 'classnames/bind';
import styles from './ProductSell.module.scss';

import { useEffect, useState } from 'react';
import { requestGetAllProducts } from '../../../config/request';
import CardBody from '../../CardBody/CardBody';

const cx = classNames.bind(styles);

function ProductSell() {
    const [dataProducts, setDataProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestGetAllProducts();
            setDataProducts(res.metadata.products);
        };
        fetchData();
    }, []);

    return (
        <div className={cx('wrapper')}>
            <header className={cx('header-slide')}>
                <h3>Sản Phẩm Nổi Bật</h3>
            </header>

            <main className={cx('main-product')}>
                {dataProducts.map((item) => (
                    <CardBody item={item} />
                ))}
            </main>
        </div>
    );
}

export default ProductSell;
