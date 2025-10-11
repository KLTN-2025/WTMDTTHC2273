import classNames from 'classnames/bind';
import styles from './RegisterUser.module.scss';

import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import Header from '../../Components/Header/Header';

import toast, { Toaster } from 'react-hot-toast';
import { requestRegister } from '../../config/request';

const cx = classNames.bind(styles);

function RegisterUser() {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleRegister = async (values) => {
        try {
            if (values.password !== values.confirmPassword) {
                return toast.error('Mật khẩu không khớp');
            }

            const data = {
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                password: values.password,
                confirmPassword: values.confirmPassword,
            };

            const res = await requestRegister(data);
            toast.success(res.message);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            navigate('/');
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <>
            <Toaster />
            <header>
                <Header />
            </header>
            <div className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <div className={cx('header-form-login')}>
                        <span>Đăng ký</span>
                        <p>Tạo tài khoản của bạn để có quyền truy cập đầy đủ</p>
                    </div>
                    <Form form={form} layout="vertical" className={cx('input-box')} onFinish={handleRegister}>
                        <Form.Item
                            name="fullName"
                            label="Họ và tên"
                            className={cx('form-input')}
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                        >
                            <Input placeholder="Họ và tên" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            className={cx('form-input')}
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            className={cx('form-input')}
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số!' },
                            ]}
                        >
                            <Input placeholder="Số điện thoại" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            className={cx('form-input')}
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                            ]}
                        >
                            <Input.Password placeholder="Mật khẩu" />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu"
                            className={cx('form-input')}
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Xác nhận mật khẩu" />
                        </Form.Item>

                        <div className={cx('login-footer')}>
                            <p>
                                Bạn đã có tài khoản ?
                                <Link id={cx('link')} to="/login">
                                    Đăng nhập
                                </Link>
                            </p>
                            <Button type="primary" htmlType="submit" className={cx('register-button')}>
                                Đăng ký
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </>
    );
}

export default RegisterUser;
