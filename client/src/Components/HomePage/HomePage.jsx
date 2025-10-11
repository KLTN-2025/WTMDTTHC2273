import classNames from 'classnames/bind';
import styles from './HomePage.module.scss';
import SideHome from './SideHome/SideHome';
import ItemProducts from './ItemProducts/ItemProducts';
import ProductSell from './ProductSell/ProductSell';

const cx = classNames.bind(styles);

function HomePage() {
    return (
        <div className={cx('wrapper')}>
            <div>
                <SideHome />
            </div>

            <div>
                <ItemProducts />
            </div>

            <div>
                <ProductSell />
            </div>
        </div>
    );
}

export default HomePage;
