import classNames from 'classnames/bind';
import styles from './Checkout.module.scss';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, AutoComplete, Button, Checkbox, Table, Space, message, Card, Row, Col } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';

import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import { useStore } from '../../hooks/useStore';
import useDebounce from '../../hooks/useDebounce';

import axios from 'axios';
import { requestPayment, requestUpdateInfoUserCart, requestApplyCoupon } from '../../config/request';

import toast, { Toaster } from 'react-hot-toast';

const cx = classNames.bind(styles);

function Checkout() {
    const { dataCart } = useStore();
    const [form] = Form.useForm();

    const [address, setAddress] = useState([]);
    const [addressOptions, setAddressOptions] = useState([]);
    const [valueAddress, setValueAddress] = useState('');
    const [checkBox, setCheckBox] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
    });

    const [nameCoupon, setNameCoupon] = useState('');

    const navigate = useNavigate();
    const debounce = useDebounce(valueAddress, 800);

    const { fetchCart } = useStore();

    // Validation rules
    const validationRules = {
        fullName: [
            { required: true, message: 'Vui lòng nhập họ tên!' },
            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' },
            { max: 50, message: 'Họ tên không được quá 50 ký tự!' },
            {
                pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                message: 'Họ tên chỉ được chứa chữ cái và khoảng trắng!',
            },
        ],
        phone: [
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            {
                pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                message: 'Số điện thoại không hợp lệ!',
            },
        ],
        email: [
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
        ],
        address: [{ required: true, message: 'Vui lòng chọn địa chỉ!' }],
    };

    // Update user cart info when form data changes
    useEffect(() => {
        const { fullName, phone, email, address: selectAddress } = formData;

        if (fullName && phone && email && selectAddress) {
            // Validate data before sending
            const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;

            if (!nameRegex.test(fullName)) {
                message.error('Họ tên chỉ được chứa chữ cái và khoảng trắng!');
                return;
            }

            if (!phoneRegex.test(phone)) {
                message.error('Số điện thoại không hợp lệ!');
                return;
            }

            if (!emailRegex.test(email)) {
                message.error('Email không hợp lệ!');
                return;
            }

            const data = {
                fullName: fullName.trim(),
                phone: phone.trim(),
                email: email.trim().toLowerCase(),
                address: selectAddress.trim(),
            };

            const handler = setTimeout(async () => {
                try {
                    await requestUpdateInfoUserCart(data);
                } catch (error) {
                    message.error('Cập nhật thông tin thất bại!');
                }
            }, 1000);

            return () => clearTimeout(handler);
        }
    }, [formData]);

    // Fetch address suggestions
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://rsapi.goong.io/Place/AutoComplete', {
                    params: {
                        input: debounce,
                        api_key: '3HcKy9jen6utmzxno4HwpkN1fJYll5EM90k53N4K',
                    },
                });
                const options =
                    response.data.predictions?.map((item) => ({
                        value: item.description,
                        label: item.description,
                    })) || [];
                setAddressOptions(options);
                setAddress(response.data.predictions || []);
            } catch (error) {
                message.error('Không thể tải danh sách địa chỉ!');
            }
        };

        if (valueAddress.trim() !== '') {
            fetchData();
        } else {
            setAddressOptions([]);
        }
    }, [debounce]);

    // Handle form field changes
    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle payment
    const handlePayment = async (typePayment) => {
        try {
            // Validate form before payment
            await form.validateFields();

            if (!checkBox) {
                message.error('Vui lòng chấp nhận điều khoản!');
                return;
            }

            // Validate cart data
            if (!dataCart?.data?.length) {
                message.error('Giỏ hàng trống!');
                return;
            }

            const res = await requestPayment({ typePayment });

            if (typePayment === 'COD') {
                navigate(`/payment/${res.metadata}`);
            } else if (typePayment === 'MOMO') {
                window.open(res.metadata.payUrl, '_blank');
            } else if (typePayment === 'VNPAY') {
                window.open(res.metadata, '_blank');
            }
        } catch (error) {
            if (error.errorFields) {
                message.error('Vui lòng kiểm tra lại thông tin!');
            } else {
                toast.error(error.response?.data?.message || 'Thanh toán thất bại!');
            }
        }
    };

    // Table columns for cart items
    const columns = [
        {
            title: 'Tên Sản Phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Số Lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity) => `x ${quantity}`,
        },
        {
            title: 'Tổng',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price?.toLocaleString()} VNĐ`,
        },
    ];

    const handleApplyCoupon = async () => {
        const data = {
            nameCoupon,
        };
        try {
            const res = await requestApplyCoupon(data);
            setDiscountAmount(res?.metadata?.discount);
            await fetchCart();
            message.success(res.message);
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('inner')}>
                <div className={cx('inner-checkout')}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={12}>
                            <Card title="Thông Tin Thanh Toán" className={cx('column-billing')}>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onValuesChange={(changedValues, allValues) => {
                                        Object.keys(changedValues).forEach((key) => {
                                            handleFieldChange(key, changedValues[key]);
                                        });
                                    }}
                                >
                                    <Form.Item name="fullName" label="Họ và tên" rules={validationRules.fullName}>
                                        <Input prefix={<UserOutlined />} placeholder="Nhập tên của bạn" size="large" />
                                    </Form.Item>

                                    <Form.Item name="phone" label="Số điện thoại" rules={validationRules.phone}>
                                        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" size="large" />
                                    </Form.Item>

                                    <Form.Item name="email" label="Email" rules={validationRules.email}>
                                        <Input prefix={<MailOutlined />} placeholder="Email của bạn" size="large" />
                                    </Form.Item>

                                    <Form.Item name="address" label="Địa chỉ" rules={validationRules.address}>
                                        <AutoComplete
                                            options={addressOptions}
                                            onSearch={setValueAddress}
                                            onSelect={(value) => {
                                                handleFieldChange('address', value);
                                            }}
                                            placeholder="Nhập địa chỉ"
                                            size="large"
                                        >
                                            <Input prefix={<EnvironmentOutlined />} />
                                        </AutoComplete>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Card title="Sản Phẩm Thanh Toán" className={cx('form-order')}>
                                <Table
                                    columns={columns}
                                    dataSource={dataCart?.data || []}
                                    pagination={false}
                                    rowKey="_id"
                                    size="small"
                                />

                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 10,
                                        textAlign: 'right',
                                        width: '100%',
                                        paddingTop: '10px',
                                    }}
                                >
                                    {discountAmount > 0 && (
                                        <strong>Giảm giá: {discountAmount?.toLocaleString()} VNĐ</strong>
                                    )}
                                    <strong>Tạm Tính: {dataCart?.totalPrice?.toLocaleString()} VNĐ</strong>
                                </div>

                                <div className={cx('form-pay')} style={{ marginTop: 24 }}>
                                    <Form.Item>
                                        <Checkbox checked={checkBox} onChange={(e) => setCheckBox(e.target.checked)}>
                                            Vui lòng chấp nhận điều khoản của chúng tôi
                                        </Checkbox>
                                    </Form.Item>

                                    <div className={cx('coupon')}>
                                        <input
                                            type="text"
                                            placeholder="Nhập mã giảm giá"
                                            value={nameCoupon}
                                            onChange={(e) => setNameCoupon(e.target.value)}
                                        />
                                        <button onClick={handleApplyCoupon}>Áp dụng</button>
                                    </div>

                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            onClick={() => handlePayment('VNPAY')}
                                            className={cx('payment-vnpay')}
                                        >
                                            <img
                                                src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png"
                                                alt="VNPAY"
                                                style={{ width: 20, height: 20, marginRight: 8 }}
                                            />
                                            Thanh Toán Qua VNPAY
                                        </Button>

                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            onClick={() => handlePayment('MOMO')}
                                            className={cx('payment-momo')}
                                            style={{ backgroundColor: '#d82d8b', borderColor: '#d82d8b' }}
                                        >
                                            <img
                                                src="https://play-lh.googleusercontent.com/uCtnppeJ9ENYdJaSL5av-ZL1ZM1f3b35u9k8EOEjK3ZdyG509_2osbXGH5qzXVmoFv0=w240-h480-rw"
                                                alt="MOMO"
                                                style={{ width: 20, height: 20, marginRight: 8 }}
                                            />
                                            Thanh Toán Qua MOMO
                                        </Button>

                                        <Button
                                            size="large"
                                            block
                                            onClick={() => handlePayment('COD')}
                                            className={cx('continue')}
                                        >
                                            Thanh Toán Khi Nhận Hàng
                                        </Button>
                                    </Space>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
                <Toaster />
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Checkout;
