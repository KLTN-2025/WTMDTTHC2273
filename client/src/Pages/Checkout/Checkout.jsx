import classNames from 'classnames/bind';
import styles from './Checkout.module.scss';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const { dataCart, fetchCart } = useStore();
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // STATE
    const [addressOptions, setAddressOptions] = useState([]);
    const [valueAddress, setValueAddress] = useState('');
    const [checkBox, setCheckBox] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [formData, setFormData] = useState({});
    const [nameCoupon, setNameCoupon] = useState('');

    const debounce = useDebounce(valueAddress, 800);

    // ---------------- VALIDATION ---------------- //
    const validationRules = {
        fullName: [
            { required: true, message: 'Vui lòng nhập họ tên!' },
            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' },
            { max: 50, message: 'Họ tên không được quá 50 ký tự!' },
            { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Họ tên chỉ được chứa chữ cái và khoảng trắng!' },
        ],
        phone: [
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/, message: 'Số điện thoại không hợp lệ!' },
        ],
        email: [
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
        ],
        address: [{ required: true, message: 'Vui lòng chọn địa chỉ!' }],
    };

    // ---------------- HANDLE ADDRESS ---------------- //
    useEffect(() => {
        if (!debounce.trim()) return setAddressOptions([]);
        axios
            .get('https://rsapi.goong.io/Place/AutoComplete', {
                params: { input: debounce, api_key: '3HcKy9jen6utmzxno4HwpkN1fJYll5EM90k53N4K' },
            })
            .then((res) => {
                const options =
                    res.data.predictions?.map((item) => ({
                        value: item.description,
                        label: item.description,
                    })) || [];
                setAddressOptions(options);
            })
            .catch(() => message.error('Không thể tải danh sách địa chỉ!'));
    }, [debounce]);

    // ---------------- HANDLE FORM CHANGE ---------------- //
    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // ---------------- AUTO UPDATE CART INFO ---------------- //
    useEffect(() => {
        const { fullName, phone, email, address } = formData || {};
        if (!(fullName && phone && email && address)) return;

        const handler = setTimeout(async () => {
            try {
                await requestUpdateInfoUserCart({
                    fullName: fullName.trim(),
                    phone: phone.trim(),
                    email: email.trim().toLowerCase(),
                    address: address.trim(),
                });
            } catch {
                message.error('Cập nhật thông tin thất bại!');
            }
        }, 800);

        return () => clearTimeout(handler);
    }, [formData]);

    // ---------------- HANDLE PAYMENT ---------------- //
    const handlePayment = useCallback(
        async (typePayment) => {
            try {
                await form.validateFields();

                if (!checkBox) return message.error('Vui lòng chấp nhận điều khoản!');
                if (!dataCart?.data?.length) return message.error('Giỏ hàng trống!');

                const res = await requestPayment({ typePayment });
                const { metadata } = res;

                switch (typePayment) {
                    case 'COD':
                        navigate(`/payment/${metadata}`);
                        break;
                    case 'MOMO':
                    case 'VNPAY':
                        window.location.href = metadata; // mở trong tab hiện tại
                        break;
                    default:
                        message.warning('Phương thức thanh toán không hợp lệ!');
                }
            } catch (error) {
                if (error.errorFields) message.error('Vui lòng kiểm tra lại thông tin!');
                else toast.error(error.response?.data?.message || 'Thanh toán thất bại!');
            }
        },
        [form, checkBox, dataCart, navigate],
    );

    // ---------------- HANDLE COUPON ---------------- //
    const handleApplyCoupon = async () => {
        try {
            const res = await requestApplyCoupon({ nameCoupon });
            setDiscountAmount(res?.metadata?.discount || 0);
            await fetchCart();
            message.success(res.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Áp dụng mã giảm giá thất bại!');
        }
    };

    // ---------------- TABLE COLUMNS ---------------- //
    const columns = [
        { title: 'Tên Sản Phẩm', dataIndex: 'name', key: 'name' },
        {
            title: 'Số Lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (q) => `x ${q}`,
        },
        {
            title: 'Tổng',
            dataIndex: 'price',
            key: 'price',
            render: (p) => `${p?.toLocaleString()} VNĐ`,
        },
    ];

    // ---------------- RETURN ---------------- //
    return (
        <div className={cx('wrapper')}>
            <Header />
            <main className={cx('inner')}>
                <Row gutter={[24, 24]}>
                    {/* ---------------- LEFT ---------------- */}
                    <Col xs={24} lg={12}>
                        <Card title="Thông Tin Thanh Toán" className={cx('column-billing')}>
                            <Form
                                form={form}
                                layout="vertical"
                                onValuesChange={(changed, all) =>
                                    Object.keys(changed).forEach((key) => handleFieldChange(key, all[key]))
                                }
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
                                        onSelect={(v) => handleFieldChange('address', v)}
                                        placeholder="Nhập địa chỉ"
                                        size="large"
                                    >
                                        <Input prefix={<EnvironmentOutlined />} />
                                    </AutoComplete>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>

                    {/* ---------------- RIGHT ---------------- */}
                    <Col xs={24} lg={12}>
                        <Card title="Sản Phẩm Thanh Toán" className={cx('form-order')}>
                            <Table
                                columns={columns}
                                dataSource={dataCart?.data || []}
                                pagination={false}
                                rowKey="_id"
                                size="small"
                            />

                            <div className={cx('summary')}>
                                {discountAmount > 0 && <strong>Giảm giá: {discountAmount.toLocaleString()} VNĐ</strong>}
                                <strong>Tạm tính: {dataCart?.totalPrice?.toLocaleString()} VNĐ</strong>
                            </div>

                            <div className={cx('form-pay')}>
                                <Checkbox checked={checkBox} onChange={(e) => setCheckBox(e.target.checked)}>
                                    Vui lòng chấp nhận điều khoản của chúng tôi
                                </Checkbox>

                                <div className={cx('coupon')}>
                                    <Input
                                        placeholder="Nhập mã giảm giá"
                                        value={nameCoupon}
                                        onChange={(e) => setNameCoupon(e.target.value)}
                                        style={{ width: '70%' }}
                                    />
                                    <Button type="primary" onClick={handleApplyCoupon}>
                                        Áp dụng
                                    </Button>
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
                                            width={20}
                                            height={20}
                                            style={{ marginRight: 8 }}
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
                                            width={20}
                                            height={20}
                                            style={{ marginRight: 8 }}
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
                <Toaster />
            </main>
            <Footer />
        </div>
    );
}

export default Checkout;
