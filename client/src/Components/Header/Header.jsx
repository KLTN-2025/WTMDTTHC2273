import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBars, faCartPlus, faUser } from '@fortawesome/free-solid-svg-icons';

import styles from './Header.module.scss';
import { useStore } from '../../hooks/useStore';
import { requestSearchProduct } from '../../config/request';
import useDebounce from '../../hooks/useDebounce';

const cx = classNames.bind(styles);

function Header() {
    const [searchValue, setSearchValue] = useState('');
    const [dataSearch, setDataSearch] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const { pathname } = useLocation();

    const { dataUser, dataCart } = useStore();
    const debounceSearch = useDebounce(searchValue, 500);

    // Determine header state based on pathname
    const checkHeader = useMemo(() => {
        const path = pathname.replace('/', '');
        const map = {
            '': 1,
            category: 1,
            blog: 2,
            contact: 3,
            checkout: 4,
            info: 5,
            cart: 5,
            login: 6,
            register: 7,
        };
        return map[path] || 0;
    }, [pathname]);

    // Handle debounced search
    useEffect(() => {
        if (!debounceSearch.trim()) {
            setDataSearch([]);
            return;
        }

        const fetchData = async () => {
            try {
                const res = await requestSearchProduct(debounceSearch);
                setDataSearch(res?.metadata || []);
            } catch (error) {
                console.error('Search failed:', error);
            }
        };

        fetchData();
    }, [debounceSearch]);

    // Toggle mobile menu
    const handleShowMenu = () => setShowMenu((prev) => !prev);

    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                {/* Logo */}
                <Link to="/" className={cx('logo')}>
                    <img src="https://5sfashion.vn/frontend/assets/images/logo.png" alt="5S Fashion Logo" />
                </Link>

                {/* Search Box */}
                <div className={cx('search-section')}>
                    <div className={cx('input-search')}>
                        <input
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Tìm kiếm sản phẩm..."
                        />
                        <FontAwesomeIcon icon={faSearch} />
                    </div>

                    {searchValue.trim() && (
                        <div className={cx('result')}>
                            {dataSearch.length > 0 ? (
                                dataSearch.map((item) => (
                                    <Link key={item._id} to={`/product/${item._id}`} className={cx('result-item')}>
                                        <img src={item.images?.[0]} alt={item.name} className={cx('img-result')} />
                                        <div>
                                            <h5>{item.name}</h5>
                                            <span>{item.price?.toLocaleString()} đ</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className={cx('no-result')}>Hiện không có sản phẩm nào phù hợp.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Menu Button (mobile) */}
                <button onClick={handleShowMenu} id={cx('btn-menu')}>
                    <FontAwesomeIcon icon={faBars} />
                    <span>Menu</span>
                </button>

                {/* Controller */}
                <nav className={cx('controller', { active: showMenu })}>
                    <ul>
                        <li>
                            <Link className={cx(checkHeader === 1 ? 'checkHeader' : 'navHeader')} to="/category">
                                Sản Phẩm
                            </Link>
                        </li>
                        <li>
                            <Link className={cx(checkHeader === 2 ? 'checkHeader' : 'navHeader')} to="/blog">
                                Bài Viết
                            </Link>
                        </li>
                        <li className={cx(checkHeader === 3 ? 'checkHeader' : 'navHeader')}>
                            <Link style={{ textDecoration: 'none', color: '#333' }} to="/contact">
                                Liên Hệ
                            </Link>
                        </li>
                        <li>
                            <Link className={cx(checkHeader === 4 ? 'checkHeader' : 'navHeader')} to="/checkout">
                                Thanh Toán
                            </Link>
                        </li>

                        {dataUser?._id ? (
                            <div className={cx('controller-user')}>
                                <Link to="/cart">
                                    <button className={cx('btn-cart')}>
                                        <FontAwesomeIcon icon={faCartPlus} />
                                        {dataCart?.data?.length > 0 && <span>{dataCart.data.length}</span>}
                                    </button>
                                </Link>
                                <Link to="/info">
                                    <button>
                                        <FontAwesomeIcon icon={faUser} />
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <li className={cx({ checkHeader: checkHeader === 6 })}>
                                    <Link to="/login">Đăng Nhập</Link>
                                </li>
                                <li className={cx({ checkHeader: checkHeader === 7 })}>
                                    <Link to="/register">Đăng Ký</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
