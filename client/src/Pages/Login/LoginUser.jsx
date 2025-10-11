import classNames from 'classnames/bind';
import styles from './LoginUser.module.scss';
import Header from '../../Components/Header/Header';

import toast, { Toaster } from 'react-hot-toast';

import { Link, useNavigate } from 'react-router-dom';
import { requestLogin, requestLoginGoogle } from '../../config/request';

import { Input, Form, Button } from 'antd';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const cx = classNames.bind(styles);
function LoginUser() {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        try {
            const res = await requestLogin(values);
            toast.success(res.message);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            navigate('/');
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const handleSuccess = async (response) => {
        const { credential } = response;
        try {
            const res = await requestLoginGoogle(credential);
            toast.success(res.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <Toaster />
            <header>
                <Header />
            </header>
            <div className={cx('container')}>
                <div className={cx('inner')}>
                    <div className={cx('header-form-login')}>
                        <span>Đăng Nhập</span>
                        <p>Nhập thông tin đăng nhập để có quyền truy cập</p>
                    </div>
                    <Form form={form} onFinish={handleLogin} layout="vertical" className={cx('input-box')}>
                        <Form.Item
                            name="email"
                            className={cx('form-input')}
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            className={cx('form-input')}
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                            ]}
                        >
                            <Input.Password placeholder="Mật khẩu" />
                        </Form.Item>

                        <div style={{ marginTop: '20px' }}>
                            <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                                <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
                            </GoogleOAuthProvider>
                        </div>
                        <div className={cx('single-input-fields')}>
                            <div style={{ float: 'right' }}>
                                <Link to="/forgot-password">Quên mật khẩu ?</Link>
                            </div>
                        </div>

                        <div className={cx('login-footer')}>
                            <p>
                                Bạn chưa có tài khoản?{' '}
                                <Link id={cx('link')} to="/register">
                                    Đăng ký
                                </Link>{' '}
                            </p>
                            <Button type="primary" htmlType="submit" className={cx('login-button')}>
                                Đăng nhập
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default LoginUser;
