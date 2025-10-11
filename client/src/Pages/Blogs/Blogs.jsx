import classNames from 'classnames/bind';
import styles from './Blogs.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { requestGetBlogs } from '../../config/request';

import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function Blogs() {
    const [dataBlogs, setDataBlogs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestGetBlogs();
            setDataBlogs(res.metadata);
        };
        fetchData();
    }, []);

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main-content')}>
                {dataBlogs.map((item) => (
                    <Link to={`/bai-viet/${item._id}`}>
                        <div className={cx('inner')}>
                            <img src={item.image} alt="" />
                            <div className={cx('content')}>
                                <h1>{item.title}</h1>
                                <FontAwesomeIcon icon={faCalendarDays} />
                                <span>{dayjs(item.createdAt).format('DD/MM/YYYY')}</span>
                                <p dangerouslySetInnerHTML={{ __html: item.content }} />
                            </div>
                        </div>
                    </Link>
                ))}
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Blogs;
