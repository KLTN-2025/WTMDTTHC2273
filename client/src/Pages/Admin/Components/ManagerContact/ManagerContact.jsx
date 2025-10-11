import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Modal, Input } from 'antd';
import classNames from 'classnames/bind';
import styles from './ManagerContact.module.scss';
import { requestGetContact, requestReplyContact } from '../../../../config/request';

const cx = classNames.bind(styles);

function ManagerContact() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const { TextArea } = Input;

    const columns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Tin nhắn',
            dataIndex: 'message',
            key: 'message',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status ? 'green' : 'red'}>{status ? 'Đã trả lời' : 'Chưa trả lời'}</Tag>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button type="primary" disabled={record.status} onClick={() => showReplyModal(record)}>
                    Trả lời
                </Button>
            ),
        },
    ];

    const showReplyModal = (contact) => {
        setSelectedContact(contact);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setReplyContent('');
        setSelectedContact(null);
    };

    const fetchContacts = async () => {
        setLoading(true);
        try {
            // Thay thế bằng API call thực tế
            const response = await requestGetContact();
            setContacts(response.metadata);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        // Fetch contacts data from API

        fetchContacts();
    }, []);

    const handleReply = async () => {
        if (!replyContent.trim()) {
            return;
        }

        try {
            const data = {
                id: selectedContact._id,
                message: replyContent,
            };
            await requestReplyContact(data);
            handleCancel();
            fetchContacts();
        } catch (error) {
            console.error('Error replying to contact:', error);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <h4>Quản lý liên hệ</h4>
            <Table columns={columns} dataSource={contacts} loading={loading} rowKey="_id" />

            <Modal
                title="Trả lời liên hệ"
                open={isModalOpen}
                onOk={handleReply}
                onCancel={handleCancel}
                okText="Gửi"
                cancelText="Hủy"
            >
                <div style={{ marginBottom: 16 }}>
                    <p>
                        <strong>Người gửi:</strong> {selectedContact?.name}
                    </p>
                    <p>
                        <strong>Email:</strong> {selectedContact?.email}
                    </p>
                    <p>
                        <strong>Nội dung:</strong> {selectedContact?.message}
                    </p>
                </div>
                <TextArea
                    rows={4}
                    placeholder="Nhập nội dung trả lời..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                />
            </Modal>
        </div>
    );
}

export default ManagerContact;
