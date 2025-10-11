import classNames from 'classnames/bind';
import styles from './Contact.module.scss';
import Header from '../../Components/Header/Header';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { requestCreateContact } from '../../config/request';

const cx = classNames.bind(styles);

function Contact() {
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        try {
            const data = {
                name: values.name,
                email: values.email,
                message: values.message,
            };
            await requestCreateContact(data);
            message.success('Cảm ơn bạn đã gửi thông tin liên hệ!');
            form.resetFields();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>
            <div className={cx('content')}>
                <div className={cx('contact-container')}>
                    <Card title="Thông tin liên hệ" className={cx('contact-info')}>
                        <div className={cx('info-item')}>
                            <EnvironmentOutlined /> Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM
                        </div>
                        <div className={cx('info-item')}>
                            <PhoneOutlined /> Điện thoại: (84) 123-456-789
                        </div>
                        <div className={cx('info-item')}>
                            <MailOutlined /> Email: contact@example.com
                        </div>
                    </Card>

                    <Card title="Gửi tin nhắn cho chúng tôi" className={cx('contact-form')}>
                        <Form form={form} name="contact" onFinish={onFinish} layout="vertical">
                            <Form.Item name="name" rules={[{ required: true, message: 'Vui lòng nhập tên của bạn!' }]}>
                                <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' },
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Email" />
                            </Form.Item>

                            <Form.Item
                                name="message"
                                rules={[{ required: true, message: 'Vui lòng nhập nội dung tin nhắn!' }]}
                            >
                                <Input.TextArea placeholder="Nội dung tin nhắn" rows={4} />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Gửi tin nhắn
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Contact;
