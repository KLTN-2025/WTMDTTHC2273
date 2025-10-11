import classNames from 'classnames/bind';
import styles from './ManagerProduct.module.scss';
import { useState, useEffect } from 'react';
import { Table, Button, Space, Image, Spin, Pagination, Typography, Row, Col, Card, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, RollbackOutlined } from '@ant-design/icons';
import AddProduct from './AddProduct/AddProduct';
import { requestDeleteProduct, requestGetAllProducts, requestGetOneProduct } from '../../../../config/request';

const cx = classNames.bind(styles);
const { Title } = Typography;

function ManagerProduct() {
    const [type, setType] = useState(0);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPage, setTotalPage] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [pageSize] = useState(5);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await requestGetAllProducts({
                limit: pageSize,
                page: currentPage,
            });

            if (res?.metadata) {
                setProducts(res.metadata.products);
                setTotalPage(res.metadata.pagination.totalPages);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách sản phẩm', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (type === 0) {
            fetchProducts();
        }
    }, [type, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDeleteProduct = async (id) => {
        try {
            const res = await requestDeleteProduct(id);
            message.success(res.message);
            fetchProducts();
        } catch (error) {
            message.error('Lỗi khi xóa sản phẩm', error);
        }
    };

    const handleEditProduct = async (productId) => {
        try {
            setLoading(true);
            const res = await requestGetOneProduct(productId);
            if (res?.metadata) {
                setSelectedProduct(res.metadata);
                setType(2); // Switching to edit mode
            }
        } catch (error) {
            message.error('Lỗi khi lấy thông tin sản phẩm', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            render: (_, __, index) => index + 1 + (currentPage - 1) * pageSize,
            width: 60,
        },
        {
            title: 'Ảnh',
            dataIndex: 'images',
            key: 'images',
            render: (images) => <Image width={80} src={images?.[0]} preview={false} />,
            align: 'center',
            width: 120,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price?.toLocaleString()} VNĐ`,
            align: 'center',
            width: 150,
        },
        {
            title: 'Số lượng còn lại',
            dataIndex: 'stock',
            key: 'stock',
            align: 'center',
            width: 150,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditProduct(record._id)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa sản phẩm"
                        description="Bạn có chắc chắn muốn xóa sản phẩm này?"
                        onConfirm={() => handleDeleteProduct(record._id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
            align: 'center',
            width: 200,
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <Card className={cx('header')} bordered={false} style={{ marginBottom: 16 }}>
                <Row
                    justify="space-between"
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}
                    align="middle"
                >
                    <Col>
                        <Title level={4} style={{ margin: 0 }}>
                            {type === 0 ? 'Danh sách sản phẩm' : type === 1 ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}
                        </Title>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={type === 0 ? <PlusOutlined /> : <RollbackOutlined />}
                            onClick={() => {
                                if (type !== 0) {
                                    setType(0);
                                    setSelectedProduct(null);
                                } else {
                                    setType(1);
                                }
                            }}
                        >
                            {type === 0 ? 'Thêm sản phẩm' : 'Quay lại'}
                        </Button>
                    </Col>
                </Row>
            </Card>

            {type === 0 ? (
                <Card className={cx('product-list')} bordered={false}>
                    <Spin spinning={loading}>
                        <Table columns={columns} dataSource={products} rowKey="_id" pagination={false} size="middle" />
                        <div className={cx('pagination-wrapper')} style={{ marginTop: 16, textAlign: 'right' }}>
                            <Pagination
                                current={currentPage}
                                total={totalPage * pageSize}
                                pageSize={pageSize}
                                onChange={handlePageChange}
                                disabled={loading}
                                showSizeChanger={false}
                            />
                        </div>
                    </Spin>
                </Card>
            ) : type === 1 ? (
                <AddProduct
                    onSuccess={() => {
                        setType(0);
                        setCurrentPage(1);
                        fetchProducts();
                    }}
                />
            ) : type === 2 && selectedProduct ? (
                <AddProduct
                    isEdit={true}
                    productData={selectedProduct}
                    onSuccess={() => {
                        setType(0);
                        setCurrentPage(1);
                        setSelectedProduct(null);
                        fetchProducts();
                    }}
                />
            ) : null}
        </div>
    );
}

export default ManagerProduct;
