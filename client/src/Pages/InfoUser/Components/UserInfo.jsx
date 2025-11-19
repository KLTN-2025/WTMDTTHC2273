import { Typography, Avatar, Button, Form, Input, Row, Col, Card, Space, message } from 'antd';
import { useState } from 'react';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from '../InfoUser.module.scss';
import { requestEditUser } from '../../../config/request';

import { useStore } from '../../../hooks/useStore';

const { Title, Text } = Typography;
const cx = classNames.bind(styles);

function UserInfo({ userData, onChangePassword }) {
    const [editing, setEditing] = useState(false);
    const [form] = Form.useForm();

    const { fetchAuth } = useStore();

    const handleEditProfile = () => {
        form.setFieldsValue({
            fullName: userData?.fullName,
            email: userData?.email,
            address: userData?.address,
            phone: userData?.phone,
        });
        setEditing(true);
    };

    const handleCancelEdit = () => {
        setEditing(false);
    };

    const handleSubmit = async (values) => {
        const res = await requestEditUser(values);
        console.log('Form values:', values);
        message.success(res.message);
        setEditing(false);
        await fetchAuth();
    };

    return (
        <div className={cx('user-info-content')}>
            <div className={cx('avatar-section')}>
                <Avatar size={150} src="https://doanwebsite.com/assets/userNotFound-DUSu2NMF.png" />
                <Title level={4}>{userData?.fullName}</Title>
            </div>

            {!editing ? (
                <Card className={cx('details-card')}>
                    <div className={cx('card-header')}>
                        <Title level={4}>Thông Tin Cá Nhân</Title>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEditProfile}
                            className={cx('edit-button')}
                        >
                            Chỉnh Sửa
                        </Button>
                    </div>

                    <div className={cx('details-section')}>
                        <div className={cx('detail-item')}>
                            <Text strong>Họ Tên:</Text>
                            <Text>{userData?.fullName}</Text>
                        </div>
                        <div className={cx('detail-item')}>
                            <Text strong>Email : </Text>
                            <Text> {userData?.email}</Text>
                        </div>
                        <div className={cx('detail-item')}>
                            <Text strong>Địa chỉ:</Text>
                            <Text>{userData?.address}</Text>
                        </div>
                        <div className={cx('detail-item')}>
                            <Text strong>Số Điện Thoại:</Text>
                            <Text>{userData?.phone}</Text>
                        </div>
                        {userData.typeLogin === 'email' && (
                            <Button onClick={onChangePassword} className={cx('change-password-btn')}>
                                Đổi Mật Khẩu
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <Card className={cx('edit-form-card')}>
                    <div className={cx('card-header')}>
                        <Title level={4}>Chỉnh Sửa Thông Tin</Title>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        className={cx('edit-form')}
                        initialValues={{
                            fullName: userData?.fullName,
                            email: userData?.email,
                            address: userData?.address,
                            phone: userData?.phone,
                        }}
                    >
                        <Form.Item
                            name="fullName"
                            label="Họ Tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                        >
                            <Input placeholder="Nhập họ tên" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input placeholder="Nhập email" disabled />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label="Địa chỉ"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                        >
                            <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số Điện Thoại"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                                    Lưu Thay Đổi
                                </Button>
                                <Button onClick={handleCancelEdit} icon={<CloseOutlined />}>
                                    Hủy
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>
            )}
        </div>
    );
}

export default UserInfo;
