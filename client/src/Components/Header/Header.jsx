import classNames from 'classnames/bind';
import styles from './Header.module.scss';

import { Link, useLocation } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBars, faCartPlus, faUser } from '@fortawesome/free-solid-svg-icons';

import { useEffect, useState } from 'react';

import { useStore } from '../../hooks/useStore';
import { requestSearchProduct } from '../../config/request';

import useDebound from '../../hooks/useDebounce';

const cx = classNames.bind(styles);

function Header() {
    const [dataSearch, setDataSearch] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [checkHeader, setCheckHeader] = useState(0);
    const [showMenu, setShowMenu] = useState(false);

    const { pathname } = useLocation();

    useEffect(() => {
        switch (pathname.slice(1, 999)) {
            case '':
                setCheckHeader(1);
                break;
            case 'category':
                setCheckHeader(1);
                break;
            case 'blog':
                setCheckHeader(2);
                break;
            case 'checkout':
                setCheckHeader(4);
                break;
            case 'login':
                setCheckHeader(6);
                break;
            case 'register':
                setCheckHeader(7);
                break;
            case 'contact':
                setCheckHeader(3);
                break;
            case 'info':
                setCheckHeader(5);
                break;
            case 'cart':
                setCheckHeader(5);
                break;
        }
    }, []);

    const { dataUser, dataCart } = useStore();

    const handleShowMenu = () => {
        setShowMenu(!showMenu);
    };

    const debounceSearch = useDebound(searchValue, 500);

    useEffect(() => {
        if (debounceSearch.length > 0) {
            const fetchData = async () => {
                const res = await requestSearchProduct(debounceSearch);
                setDataSearch(res.metadata);
            };
            fetchData();
        }
    }, [debounceSearch]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Link style={{ textDecoration: 'none' }} to="/">
                    <div className={cx('logo')}>
                        <img src={'https://5sfashion.vn/frontend/assets/images/logo.png'} alt="" />
                    </div>
                </Link>

                <div className={cx('')}>
                    <div className={cx('input-search')}>
                        <input onChange={(e) => setSearchValue(e.target.value)} />
                        <FontAwesomeIcon icon={faSearch} style={{ paddingRight: '15px' }} />
                    </div>
                    <div className={cx('search-result')}>
                        {dataSearch.length > 0 && searchValue ? (
                            <div className={cx('result')}>
                                {dataSearch.map((item) => (
                                    <Link to={`/product/${item?._id}`} key={item?._id} id={cx('test')}>
                                        <div className={cx('form-result')}>
                                            <img id={cx('img-result')} src={`${item?.images[0]}`} alt="" />
                                            <h5>{item?.name}</h5>
                                            <span>{item?.price?.toLocaleString()} đ</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>

                <div onClick={handleShowMenu} id={cx('btn-menu')}>
                    <span>Menu</span>
                    <FontAwesomeIcon icon={faBars} />
                </div>

                <div className={cx('controller')}>
                    <ul>
                        <Link
                            style={{ textDecoration: 'none', color: '#333' }}
                            to="/category"
                            onClick={() => setCheckHeader(0)}
                        >
                            <li className={cx(checkHeader === 1 ? 'checkHeader' : '')}>Sản Phẩm</li>
                        </Link>

                        <Link
                            style={{ textDecoration: 'none', color: '#333' }}
                            to="/blog"
                            onClick={() => setCheckHeader(1)}
                        >
                            <li className={cx(checkHeader === 2 ? 'checkHeader' : '')}>Bài Viết</li>
                        </Link>
                        <Link
                            style={{ textDecoration: 'none', color: '#333' }}
                            to="/contact"
                            onClick={() => setCheckHeader(2)}
                        >
                            <li className={cx(checkHeader === 3 ? 'checkHeader' : '')}>Liên Hệ</li>
                        </Link>
                        <Link
                            style={{ textDecoration: 'none', color: '#333' }}
                            to="/checkout"
                            onClick={() => setCheckHeader(3)}
                        >
                            <li className={cx(checkHeader === 4 ? 'checkHeader' : '')}>Thanh Toán</li>
                        </Link>

                        {dataUser._id ? (
                            <>
                                <div className={cx('controller-user')}>
                                    <Link to="/cart">
                                        <button id={cx('btn-cart')}>
                                            <FontAwesomeIcon icon={faCartPlus} />
                                            {dataCart?.data?.length > 0 && <span>{dataCart?.data?.length}</span>}
                                        </button>
                                    </Link>
                                    <Link to={dataUser._id ? '/info' : '/login'}>
                                        <button>
                                            <FontAwesomeIcon icon={faUser} />
                                        </button>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    style={{ textDecoration: 'none', color: '#333' }}
                                    to={dataUser._id ? '/info' : '/login'}
                                    className={cx(checkHeader === 6 ? 'checkHeader' : '')}
                                >
                                    <li>Đăng Nhập</li>
                                </Link>{' '}
                                <Link
                                    style={{ textDecoration: 'none', color: '#333' }}
                                    to={'/register'}
                                    className={cx(checkHeader === 7 ? 'checkHeader' : '')}
                                >
                                    <li>Đăng Ký</li>
                                </Link>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Header;
