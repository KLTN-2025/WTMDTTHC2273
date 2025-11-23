import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, message, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, AppstoreOutlined } from '@ant-design/icons';

import {
    requestCreateCategory,
    requestGetAllCategories,
    requestDeleteCategory,
    requestUpdateCategory,
} from '../../../../config/request';

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingCategory, setEditingCategory] = useState(null);

    const fetchCategories = async () => {
        const res = await requestGetAllCategories();
        setCategories(res.metadata);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const showModal = (category = null) => {
        setEditingCategory(category);

        if (category) {
            form.setFieldsValue({
                categoryName: category.categoryName,
                description: category.description,
            });
        } else {
            form.resetFields();
        }

        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        form.validateFields().then(async (values) => {
            if (editingCategory) {
                await requestUpdateCategory({
                    _id: editingCategory._id,
                    ...values,
                });
                message.success('Cập nhật danh mục thành công!');
            } else {
                await requestCreateCategory(values);
                message.success('Thêm danh mục thành công!');
            }

            setIsModalOpen(false);
            form.resetFields();
            fetchCategories();
        });
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Bạn có chắc muốn xóa danh mục này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                await requestDeleteCategory(id);
                fetchCategories();
                message.success('Xóa danh mục thành công!');
            },
        });
    };

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 180,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                    </Tooltip>

                    <Tooltip title="Xóa">
                        <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Quản lý danh mục sản phẩm</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Thêm danh mục
                </Button>
            </div>

            <Card>
                <Table dataSource={categories} columns={columns} rowKey="_id" pagination={{ pageSize: 10 }} />
            </Card>

            <Modal
                title={editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText={editingCategory ? 'Cập nhật' : 'Thêm mới'}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="categoryName"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                        <Input placeholder="Nhập tên danh mục" prefix={<AppstoreOutlined />} />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea placeholder="Nhập mô tả danh mục" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default CategoryManagement;
