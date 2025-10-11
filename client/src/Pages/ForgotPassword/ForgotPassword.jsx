import { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, message, Card, Space } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { requestResetPassword, requestSendMailForgetPassword } from '../../config/request';
import { useNavigate } from 'react-router-dom';
import cookies from 'js-cookie';

import classNames from 'classnames/bind';
import styles from './ForgotPassword.module.scss';
const cx = classNames.bind(styles);

const { Title } = Typography;

function ForgotPassword() {
    const [form] = Form.useForm();
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sendCodeLoading, setSendCodeLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = cookies.get('tokenOtp');
        if (token) {
            setIsCodeSent(true);
        }
    }, []);

    const handleSendCode = async (values) => {
        setSendCodeLoading(true);
        try {
            await requestSendMailForgetPassword({ email: values.email });
            setIsCodeSent(true);
            message.success('Mã xác nhận đã được gửi đến email của bạn');
        } catch (error) {
            setIsCodeSent(false);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi email');
        } finally {
            setSendCodeLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        const data = {
            newPassword: values.newPassword,
            otp: values.verificationCode,
        };

        try {
            const res = await requestResetPassword(data);
            message.success(res.message || 'Đổi mật khẩu thành công');
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (error) {
            console.log(error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
    };

    const mainContentStyle = {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        backgroundColor: '#f5f5f5',
    };

    const cardStyle = {
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    };

    return (
        <div className={cx('wrapper')} style={containerStyle}>
            <Header />

            <main style={mainContentStyle}>
                <Card style={cardStyle}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Title level={3} style={{ textAlign: 'center', marginBottom: 0 }}>
                            Quên mật khẩu
                        </Title>

                        {!isCodeSent ? (
                            <Form form={form} layout="vertical" onFinish={handleSendCode} autoComplete="off">
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập email!',
                                        },
                                        {
                                            type: 'email',
                                            message: 'Email không hợp lệ!',
                                        },
                                    ]}
                                >
                                    <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" size="large" />
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={sendCodeLoading}
                                        size="large"
                                        block
                                    >
                                        Gửi mã xác nhận
                                    </Button>
                                </Form.Item>
                            </Form>
                        ) : (
                            <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
                                <Form.Item
                                    label="Mã xác nhận"
                                    name="verificationCode"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập mã xác nhận!',
                                        },
                                    ]}
                                >
                                    <Input prefix={<SafetyOutlined />} placeholder="Nhập mã xác nhận" size="large" />
                                </Form.Item>

                                <Form.Item
                                    label="Mật khẩu mới"
                                    name="newPassword"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập mật khẩu mới!',
                                        },
                                        {
                                            min: 6,
                                            message: 'Mật khẩu phải có ít nhất 6 ký tự!',
                                        },
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="Nhập mật khẩu mới"
                                        size="large"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Xác nhận mật khẩu mới"
                                    name="confirmPassword"
                                    dependencies={['newPassword']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng xác nhận mật khẩu mới!',
                                        },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="Xác nhận mật khẩu mới"
                                        size="large"
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={loading} size="large" block>
                                        Xác nhận
                                    </Button>
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="link"
                                        onClick={() => {
                                            setIsCodeSent(false);
                                            form.resetFields();
                                        }}
                                        style={{ padding: 0 }}
                                    >
                                        ← Quay lại nhập email
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}
                    </Space>
                </Card>
            </main>

            <Footer />
        </div>
    );
}

export default ForgotPassword;
