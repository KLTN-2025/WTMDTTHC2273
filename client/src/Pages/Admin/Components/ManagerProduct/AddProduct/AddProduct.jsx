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
    requestGetAllCategories,
} from '../../../../../config/request';

const cx = classNames.bind(styles);
const { Title } = Typography;
const { Option } = Select;

function AddProduct({ isEdit = false, productData: initialProduct, onSuccess }) {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await requestGetAllCategories();
                setCategories(res.metadata || []);
            } catch (error) {
                console.log('Lỗi lấy danh mục:', error);
            }
        };

        fetchCategories();
    }, []);

    const genders = [
        { value: 'nam', label: 'Nam' },
        { value: 'nu', label: 'Nữ' },
        { value: 'unisex', label: 'Unisex' },
    ];

    // Set các field cơ bản khi vào chế độ edit
    useEffect(() => {
        if (isEdit && initialProduct?.product) {
            const p = initialProduct.product;
            form.setFieldsValue({
                name: p.name,
                gender: p.gender,
                price: p.price,
                stock: p.stock,
                category: p.categoryId,
                size: p.size,
                color: p.color,
                material: p.material,
                brand: p.brand,
            });

            setDescription(p.description || '');
            setImageUrls(p.images || []);
        }
    }, [isEdit, initialProduct]);

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

    const handleDeleteImages = async (index, url) => {
        message.loading('Đang xóa hình ảnh...');

        try {
            const res = await requestDeleteImage(url);

            setImageUrls((prev) => prev.filter((_, i) => i !== index));
            message.destroy();
            message.success(res.message);
        } catch (error) {
            message.destroy();
            message.error('Có lỗi xảy ra');
        }
    };

    const onFinish = async (values) => {
        try {
            const productData = {
                name: values.name,
                categoryId: values.category,
                gender: values.gender,
                price: values.price,
                stock: values.stock,
                description: description,
                images: imageUrls,
                size: values.size,
                color: values.color,
                material: values.material,
                brand: values.brand,
            };

            if (isEdit && initialProduct) {
                productData._id = initialProduct.product._id;
            }

            const res = isEdit ? await requestEditProduct(productData) : await requestCreateProduct(productData);

            message.success(res.message);
            if (onSuccess) onSuccess();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <Card className={cx('wrapper')} bordered={false}>
            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
                {/* Basic info */}
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
                            <Select placeholder="Chọn danh mục">
                                {categories.map((c) => (
                                    <Option key={c._id} value={c._id}>
                                        {c.categoryName}
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
                                {genders.map((g) => (
                                    <Option key={g.value} value={g.value}>
                                        {g.label}
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
                    <Col span={12}>
                        <Form.Item
                            name="size"
                            label="Kích thước"
                            rules={[{ required: true, message: 'Vui lòng nhập kích thước' }]}
                        >
                            <Input placeholder="Nhập kích thước" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="color"
                            label="Màu sắc"
                            rules={[{ required: true, message: 'Vui lòng nhập màu sắc' }]}
                        >
                            <Input placeholder="Nhập màu sắc" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="material"
                            label="Chất liệu"
                            rules={[{ required: true, message: 'Vui lòng nhập chất liệu' }]}
                        >
                            <Input placeholder="Nhập chất liệu" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="brand"
                            label="Thương hiệu"
                            rules={[{ required: true, message: 'Vui lòng nhập thương hiệu' }]}
                        >
                            <Input placeholder="Nhập thương hiệu" />
                        </Form.Item>
                    </Col>
                </Row>
                {/* Description */}
                <div style={{ marginTop: 24 }}>
                    <Title level={5}>Mô tả sản phẩm</Title>
                    <Divider />
                </div>
                <Form.Item label="Mô tả">
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
                {/* Images */}
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
                {/* Submit */}
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
