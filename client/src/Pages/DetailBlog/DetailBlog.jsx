import classNames from 'classnames/bind';
import styles from './DetailBlog.module.scss';

import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { requestGetBlog } from '../../config/request';

const cx = classNames.bind(styles);

function DetailBlog() {
    const { id } = useParams();

    const [dataBlog, setDataBlog] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestGetBlog(id);
            setDataBlog(res.metadata);
        };
        fetchData();
    }, [id]);

    return (
        <div>
            <header>
                <Header />
            </header>
            <main className={cx('main-content')}>
                <img src={dataBlog.image} alt="" />
                <h1>
                    <span>{dataBlog.title}</span>
                </h1>
                <p dangerouslySetInnerHTML={{ __html: dataBlog.content }} />
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default DetailBlog;
