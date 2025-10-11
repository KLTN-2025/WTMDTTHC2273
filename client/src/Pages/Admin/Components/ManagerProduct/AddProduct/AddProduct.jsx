import classNames from 'classnames/bind';
import styles from './AddProduct.module.scss';
import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    Button,
    Upload,
    Space,
    Card,
    Row,
    Col,
    Divider,
    Typography,
    InputNumber,
    Image,
    message,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react';
import {
    requestCreateProduct,
    requestUploadImage,
    requestEditProduct,
    requestDeleteImage,
} from '../../../../../config/request';

const cx = classNames.bind(styles);
const { Title, Text } = Typography;
const { Option } = Select;

function AddProduct({ isEdit = false, productData: initialProduct, onSuccess }) {
    const [form] = Form.useForm();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [fileList, setFileList] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);
    const [description, setDescription] = useState('');

    const categories = [
        { value: 'ao', label: 'Áo' },
        { value: 'quan', label: 'Quần' },
        { value: 'vay', label: 'Váy' },
        { value: 'dam', label: 'Đầm' },
        { value: 'phu_kien', label: 'Phụ kiện' },
        { value: 'giay_dep', label: 'Giày dép' },
        { value: 'tui_xach', label: 'Túi xách' },
    ];

    const genders = [
        { value: 'nam', label: 'Nam' },
        { value: 'nu', label: 'Nữ' },
        { value: 'unisex', label: 'Unisex' },
    ];

    const categoryAttributes = {
        ao: [
            { name: 'size', label: 'Kích thước', type: 'text' },
            { name: 'color', label: 'Màu sắc', type: 'text' },
            { name: 'material', label: 'Chất liệu', type: 'text' },
            { name: 'brand', label: 'Thương hiệu', type: 'text' },
        ],
        quan: [
            { name: 'size', label: 'Kích thước', type: 'text' },
            { name: 'color', label: 'Màu sắc', type: 'text' },
            { name: 'material', label: 'Chất liệu', type: 'text' },
            { name: 'brand', label: 'Thương hiệu', type: 'text' },
        ],
        vay: [
            { name: 'size', label: 'Kích thước', type: 'text' },
            { name: 'color', label: 'Màu sắc', type: 'text' },
            { name: 'material', label: 'Chất liệu', type: 'text' },
            { name: 'brand', label: 'Thương hiệu', type: 'text' },
        ],
        dam: [
            { name: 'size', label: 'Kích thước', type: 'text' },
            { name: 'color', label: 'Màu sắc', type: 'text' },
            { name: 'material', label: 'Chất liệu', type: 'text' },
            { name: 'brand', label: 'Thương hiệu', type: 'text' },
        ],
        phu_kien: [
            { name: 'color', label: 'Màu sắc', type: 'text' },
            { name: 'material', label: 'Chất liệu', type: 'text' },
            { name: 'brand', label: 'Thương hiệu', type: 'text' },
        ],
        giay_dep: [
            { name: 'size', label: 'Kích thước', type: 'text' },
            { name: 'color', label: 'Màu sắc', type: 'text' },
            { name: 'brand', label: 'Thương hiệu', type: 'text' },
        ],
        tui_xach: [
            { name: 'color', label: 'Màu sắc', type: 'text' },
            { name: 'material', label: 'Chất liệu', type: 'text' },
            { name: 'brand', label: 'Thương hiệu', type: 'text' },
        ],
    };

    // Initialize form with product data if in edit mode
    useEffect(() => {
        if (isEdit && initialProduct) {
            form.setFieldsValue({
                name: initialProduct.name,
                category: initialProduct.category,
                gender: initialProduct.gender,
                price: initialProduct.price,
                stock: initialProduct.stock,
                ...Object.keys(initialProduct.attributes || {}).reduce((acc, key) => {
                    acc[`attr_${key}`] = initialProduct.attributes[key];
                    return acc;
                }, {}),
            });

            setSelectedCategory(initialProduct.category);
            setDescription(initialProduct.description || '');
            setImageUrls(initialProduct.images || []);
        }
    }, [isEdit, initialProduct, form]);

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);

        // Reset attribute fields when category changes
        const attributeFields = form.getFieldsValue();
        Object.keys(attributeFields).forEach((key) => {
            if (key.startsWith('attr_')) {
                form.setFieldValue(key, '');
            }
        });
    };

    const handleEditorChange = (content) => {
        setDescription(content);
    };

    const handleImageUpload = async (options) => {
        const { file, onSuccess, onError } = options;

        const formData = new FormData();
        formData.append('images', file);
        formData.append('typeImages', 'product');
        try {
            message.loading('Đang tải lên hình ảnh...');
            const res = await requestUploadImage(formData);
            setImageUrls((prev) => [...prev, ...res.metadata]);
            onSuccess('ok');
            message.destroy();
            message.success('Tải lên hình ảnh thành công');
        } catch (error) {
            message.destroy();
            message.error('Lỗi khi tải lên hình ảnh');
            onError('Upload failed');
        }
    };

    const handleRemoveImage = (index) => {
        setImageUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const onFinish = async (values) => {
        try {
            // Prepare product data object
            const productData = {
                name: values.name,
                category: values.category,
                gender: values.gender,
                price: values.price,
                stock: values.stock,
                description: description,
                images: imageUrls,
                attributes: Object.keys(values)
                    .filter((key) => key.startsWith('attr_'))
                    .reduce((acc, key) => {
                        const attributeName = key.replace('attr_', '');
                        acc[attributeName] = values[key];
                        return acc;
                    }, {}),
            };

            // Add product ID if in edit mode
            if (isEdit && initialProduct) {
                productData._id = initialProduct._id;
            }

            // Submit data to API
            const res = isEdit ? await requestEditProduct(productData) : await requestCreateProduct(productData);

            message.success(res.message);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteImages = async (index, url) => {
        message.loading('Đang xóa hình ảnh...');
        try {
            const res = await requestDeleteImage(url);
            setImageUrls((prev) => prev.filter((_, i) => i !== index));
            message.success(res.message);
            message.destroy();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
            message.destroy();
        }
    };

    return (
        <Card className={cx('wrapper')} bordered={false}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark="optional"
                initialValues={{
                    name: '',
                    category: '',
                    gender: '',
                    price: '',
                    stock: '',
                }}
            >
                <div>
                    <Title level={5}>Thông tin cơ bản</Title>
                    <Divider />
                </div>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Tên sản phẩm"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                        >
                            <Input placeholder="Nhập tên sản phẩm" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="category"
                            label="Danh mục"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                        >
                            <Select placeholder="Chọn danh mục" onChange={handleCategoryChange}>
                                {categories.map((category) => (
                                    <Option key={category.value} value={category.value}>
                                        {category.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="gender"
                            label="Giới tính"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                        >
                            <Select placeholder="Chọn giới tính">
                                {genders.map((gender) => (
                                    <Option key={gender.value} value={gender.value}>
                                        {gender.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Nhập giá"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                min={0}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="stock"
                            label="Số lượng tồn kho"
                            rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho' }]}
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="Nhập số lượng tồn kho" min={0} />
                        </Form.Item>
                    </Col>
                </Row>

                {selectedCategory && (
                    <>
                        <div style={{ marginTop: 24 }}>
                            <Title level={5}>Thông tin chi tiết</Title>
                            <Divider />
                        </div>

                        <Row gutter={24}>
                            {categoryAttributes[selectedCategory]?.map((attr) => (
                                <Col span={12} key={attr.name}>
                                    <Form.Item
                                        name={`attr_${attr.name}`}
                                        label={attr.label}
                                        rules={[{ required: true, message: `Vui lòng nhập ${attr.label}` }]}
                                    >
                                        <Input placeholder={`Nhập ${attr.label}`} />
                                    </Form.Item>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}

                <div style={{ marginTop: 24 }}>
                    <Title level={5}>Mô tả sản phẩm</Title>
                    <Divider />
                </div>

                <Form.Item label="Mô tả" style={{ marginBottom: 24 }}>
                    <Editor
                        value={description}
                        onEditorChange={handleEditorChange}
                        apiKey="mn7zp07okzpuzr56iv65o411gotspjx8ldaoyeh83pa3ss4x"
                        init={{
                            height: 400,
                            menubar: false,
                            plugins: 'lists link image emoticons',
                            toolbar: 'blocks bold italic | bullist numlist | link image | emoticons',
                        }}
                    />
                </Form.Item>

                <div style={{ marginTop: 24 }}>
                    <Title level={5}>Hình ảnh sản phẩm</Title>
                    <Divider />
                </div>

                <Form.Item label="Hình ảnh">
                    <Upload
                        customRequest={handleImageUpload}
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                        multiple
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
                    </Upload>

                    <div style={{ marginTop: 16 }}>
                        <Row gutter={[16, 16]}>
                            {imageUrls.map((url, index) => (
                                <Col span={6} key={index}>
                                    <Card
                                        hoverable
                                        bodyStyle={{ padding: 0 }}
                                        cover={<Image src={url} preview={false} />}
                                        actions={[
                                            <DeleteOutlined
                                                key="delete"
                                                onClick={() => handleDeleteImages(index, url)}
                                            />,
                                        ]}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Form.Item>

                <Form.Item style={{ marginTop: 24 }}>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            {isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                        </Button>
                        <Button onClick={() => onSuccess && onSuccess()}>Hủy</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default AddProduct;
