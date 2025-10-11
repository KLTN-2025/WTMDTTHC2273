import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { UserOutlined, ShoppingOutlined, StarOutlined, LogoutOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './InfoUser.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { useStore } from '../../hooks/useStore';
import { requestLogout } from '../../config/request';

// Imported Components
import UserInfo from './Components/UserInfo';
import OrderManagement from './Components/OrderManagement';
import ReviewManagement from './Components/ReviewManagement';
import ChangePasswordModal from './Components/ChangePasswordModal';

const { Content, Sider } = Layout;
const cx = classNames.bind(styles);

function InfoUser() {
    const [activeTab, setActiveTab] = useState('info');
    const [changePasswordModal, setChangePasswordModal] = useState(false);

    const { dataUser } = useStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await requestLogout();
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    const handleMenuClick = (key) => {
        if (key === 'logout') {
            handleLogout();
            return;
        }
        setActiveTab(key);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'info':
                return <UserInfo userData={dataUser} onChangePassword={() => setChangePasswordModal(true)} />;
            case 'orders':
                return <OrderManagement />;
            case 'reviews':
                return <ReviewManagement />;
            default:
                return null;
        }
    };

    return (
        <Layout className={cx('user-layout')}>
            <Header />
            <Layout className={cx('main-layout')}>
                <Sider width={250} className={cx('user-sider')}>
                    <Menu
                        mode="inline"
                        selectedKeys={[activeTab]}
                        className={cx('user-menu')}
                        onClick={({ key }) => handleMenuClick(key)}
                        items={[
                            {
                                key: 'info',
                                icon: <UserOutlined />,
                                label: 'Thông Tin Cá Nhân',
                            },
                            {
                                key: 'orders',
                                icon: <ShoppingOutlined />,
                                label: 'Quản Lý Đơn Hàng',
                            },
                            {
                                key: 'reviews',
                                icon: <StarOutlined />,
                                label: 'Quản Lý Đánh Giá',
                            },
                            {
                                key: 'logout',
                                icon: <LogoutOutlined />,
                                label: 'Đăng Xuất',
                                danger: true,
                            },
                        ]}
                    />
                </Sider>
                <Content className={cx('user-content')}>{renderContent()}</Content>
            </Layout>
            <Footer />

            <ChangePasswordModal open={changePasswordModal} onClose={() => setChangePasswordModal(false)} />
        </Layout>
    );
}

export default InfoUser;
