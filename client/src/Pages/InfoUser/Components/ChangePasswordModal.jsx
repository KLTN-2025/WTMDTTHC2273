import { Modal, Form, Input, Button } from 'antd';
import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../InfoUser.module.scss';
import { requestChangePassword } from '../../../config/request';

const cx = classNames.bind(styles);

function ChangePasswordModal({ open, onClose }) {
    const [form] = Form.useForm();

    const handleChangePassword = async (values) => {
        try {
            await requestChangePassword(values);
            form.resetFields();
            onClose();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Modal title="Đổi Mật Khẩu" open={open} onCancel={onClose} footer={null}>
            <Form form={form} layout="vertical" onFinish={handleChangePassword}>
                <Form.Item
                    name="oldPassword"
                    label="Mật Khẩu Hiện Tại"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="newPassword"
                    label="Mật Khẩu Mới"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    label="Xác Nhận Mật Khẩu Mới"
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
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
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <div className={cx('modal-actions')}>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            Xác Nhận
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ChangePasswordModal;
