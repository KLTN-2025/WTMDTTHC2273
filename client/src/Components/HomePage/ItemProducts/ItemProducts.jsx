import classNames from 'classnames/bind';

import styles from './ItemProducts.module.scss';

import img1 from '../../../assets/images/items1.jpg';
import img3 from '../../../assets/images/items3.jpg';
import img4 from '../../../assets/images/items4.jpeg';

const cx = classNames.bind(styles);

function ItemProducts() {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('row-product')}>
                <img id={cx('img-item')} src="https://pos.nvncdn.com/610190-8921/ps/20250329_1oVTibpfv1.jpeg" alt="" />
            </div>

            <div className={cx('row-product')}>
                <img id={cx('img-item')} src="https://pos.nvncdn.com/610190-8921/ps/20250329_bgx66mTHAG.jpeg" alt="" />
            </div>
            <div className={cx('row-product')}>
                <img id={cx('img-item')} src="https://pos.nvncdn.com/610190-8921/ps/20250303_dWQMb7yEGE.jpeg" alt="" />
            </div>
        </div>
    );
}

export default ItemProducts;
