import classNames from 'classnames/bind';
import styles from './SideHome.module.scss';

import imgBanner11 from '../../../assets/images/imgBanner11.png';
import imgBanner12 from '../../../assets/images/imgBanner12.png';
import imgBanner23 from '../../../assets/images/imgBanner13.png';

import Slider from 'react-slick';

const cx = classNames.bind(styles);

const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
};

function SideHome() {
    return (
        <div className={cx('slide-container')}>
            <Slider {...settings}>
                <div>
                    <img id={cx('test')} src={imgBanner11} />
                </div>
                <div>
                    <img id={cx('test')} src={imgBanner12} />
                </div>
                <div>
                    <img id={cx('test')} src={imgBanner23} />
                </div>
            </Slider>
        </div>
    );
}

export default SideHome;
