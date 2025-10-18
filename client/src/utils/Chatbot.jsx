import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import { Button, Input, Card, Avatar, Typography, Spin, FloatButton, Space, Divider } from 'antd';
import {
    CommentOutlined,
    CloseOutlined,
    SendOutlined,
    RobotOutlined,
    UserOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { requestChatbot } from '../config/request';
import styles from './Chatbot.module.scss';

const { Text } = Typography;
const cx = classNames.bind(styles);

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            text: 'Xin chào! Tôi là trợ lý bán hàng AI. Tôi có thể giúp gì cho bạn hôm nay? 🤖',
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (inputMessage.trim() && !isLoading) {
            const userMessage = inputMessage.trim();
            const timestamp = new Date().toLocaleTimeString();

            setMessages((prev) => [...prev, { text: userMessage, sender: 'user', timestamp }]);
            setInputMessage('');
            setIsLoading(true);

            try {
                const response = await requestChatbot({ question: userMessage });
                setMessages((prev) => [
                    ...prev,
                    { text: response, sender: 'bot', timestamp: new Date().toLocaleTimeString() },
                ]);
            } catch {
                setMessages((prev) => [
                    ...prev,
                    {
                        text: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau ít phút. 😔',
                        sender: 'bot',
                        timestamp: new Date().toLocaleTimeString(),
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div>
            <FloatButton
                icon={isOpen ? <CloseOutlined /> : <CommentOutlined />}
                type="primary"
                className={cx('chatbot-float-btn')}
                onClick={() => setIsOpen(!isOpen)}
            />

            {isOpen && (
                <Card className={cx('chatbot-card')} bodyStyle={{ padding: 0, height: '100%' }}>
                    {/* Header */}
                    <div className={cx('chatbot-header')}>
                        <Space>
                            <Avatar icon={<RobotOutlined />} className={cx('chatbot-avatar-header')} />
                            <div>
                                <Text strong className={cx('chatbot-title')}>
                                    Trợ lý AI
                                </Text>
                                <div className={cx('chatbot-status')}>Đang hoạt động</div>
                            </div>
                        </Space>
                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={() => setIsOpen(false)}
                            className={cx('chatbot-close-btn')}
                        />
                    </div>

                    {/* Messages */}
                    <div className={cx('chatbot-messages')}>
                        {messages.map((msg, i) => (
                            <div key={i} className={cx('chatbot-message-row', msg.sender)}>
                                <Avatar
                                    icon={msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                    className={cx('chatbot-avatar', msg.sender)}
                                />
                                <div className={cx('chatbot-message-content')}>
                                    <div className={cx('chatbot-bubble', msg.sender)}>
                                        <Text>{msg.text}</Text>
                                    </div>
                                    <Text className={cx('chatbot-timestamp')}>{msg.timestamp}</Text>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className={cx('chatbot-loading')}>
                                <Avatar icon={<RobotOutlined />} className={cx('chatbot-avatar', 'bot')} />
                                <div className={cx('chatbot-loading-bubble')}>
                                    <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} size="small" />
                                    <Text style={{ marginLeft: 8 }}>Đang soạn tin nhắn...</Text>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <Divider style={{ margin: 0 }} />

                    {/* Input */}
                    <div className={cx('chatbot-input-container')}>
                        <Space.Compact style={{ width: '100%' }}>
                            <Input
                                placeholder="Nhập tin nhắn của bạn..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onPressEnter={handleSubmit}
                                disabled={isLoading}
                                className={cx('chatbot-input')}
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSubmit}
                                disabled={!inputMessage.trim() || isLoading}
                                className={cx('chatbot-send-btn')}
                            />
                        </Space.Compact>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Chatbot;
