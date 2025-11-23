import classNames from 'classnames/bind';
import styles from './Category.module.scss';
import { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Slider,
    Stack,
    Divider,
} from '@mui/material';
import { requestGetProducts, requestFilterProducts, requestGetAllCategories } from '../../config/request';
import CardBody from '../../Components/CardBody/CardBody';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

const cx = classNames.bind(styles);

function Category() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Gom tất cả các filters vào 1 state
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        origin: '',
        gender: '',
        size: '',
        color: '',
        material: '',
        sortBy: 'default',
        searchQuery: '',
        priceRange: [0, 10000000],
    });

    // Danh mục cơ bản
    const [categories, setCategories] = useState([]);

    const genders = [
        { value: 'nam', label: 'Nam' },
        { value: 'nu', label: 'Nữ' },
        { value: 'unisex', label: 'Unisex' },
    ];

    const sortOptions = [
        { value: 'default', label: 'Mặc định' },
        { value: 'price_asc', label: 'Giá: Thấp đến cao' },
        { value: 'price_desc', label: 'Giá: Cao đến thấp' },
    ];

    // Fetch tất cả sản phẩm ban đầu
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await requestGetProducts();
                const data = Array.isArray(response.metadata) ? response.metadata : [];
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
                setFilteredProducts([]);
            }
        };

        const fetchCategories = async () => {
            try {
                const res = await requestGetAllCategories();
                setCategories(res.metadata || []);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };

        fetchProducts();
        fetchCategories();
    }, []);

    // Lấy danh sách unique từ dữ liệu
    const brands = [...new Set(products.map((p) => p.attributes?.brand).filter(Boolean))];
    const origins = [...new Set(products.map((p) => p.attributes?.origin).filter(Boolean))];
    const sizes = [...new Set(products.map((p) => p.attributes?.size).filter(Boolean))];
    const colors = [...new Set(products.map((p) => p.attributes?.color).filter(Boolean))];
    const materials = [...new Set(products.map((p) => p.attributes?.material).filter(Boolean))];

    // Lọc sản phẩm khi filters thay đổi
    useEffect(() => {
        const fetchFilteredProducts = async () => {
            try {
                setLoading(true);
                const response = await requestFilterProducts({
                    category: filters.category,
                    minPrice: filters.priceRange[0],
                    maxPrice: filters.priceRange[1],
                    searchQuery: filters.searchQuery,
                    brand: filters.brand,
                    origin: filters.origin,
                    gender: filters.gender,
                    size: filters.size,
                    color: filters.color,
                    material: filters.material,
                    sortBy: filters.sortBy,
                });
                setFilteredProducts(response.metadata || []);
            } catch (error) {
                console.error('Error filtering products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredProducts();
    }, [filters]);

    // Cập nhật filter chung
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                {/* LEFT FILTER SIDEBAR */}
                <aside className={cx('left')}>
                    <Stack spacing={3} sx={{ p: 2 }}>
                        <Typography variant="h6">Bộ lọc</Typography>

                        {/* Sort */}
                        <FormControl fullWidth>
                            <InputLabel>Sắp xếp theo</InputLabel>
                            <Select
                                value={filters.sortBy}
                                label="Sắp xếp theo"
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            >
                                {sortOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider />

                        {/* Danh mục */}
                        <FormControl fullWidth>
                            <InputLabel>Danh mục</InputLabel>
                            <Select
                                value={filters.category}
                                label="Danh mục"
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat._id} value={cat._id}>
                                        {cat.categoryName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Thương hiệu */}
                        {brands.length > 0 && (
                            <FormControl fullWidth>
                                <InputLabel>Thương hiệu</InputLabel>
                                <Select
                                    value={filters.brand}
                                    label="Thương hiệu"
                                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {brands.map((b) => (
                                        <MenuItem key={b} value={b}>
                                            {b}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Xuất xứ */}
                        {origins.length > 0 && (
                            <FormControl fullWidth>
                                <InputLabel>Xuất xứ</InputLabel>
                                <Select
                                    value={filters.origin}
                                    label="Xuất xứ"
                                    onChange={(e) => handleFilterChange('origin', e.target.value)}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {origins.map((o) => (
                                        <MenuItem key={o} value={o}>
                                            {o}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Giới tính */}
                        <FormControl fullWidth>
                            <InputLabel>Giới tính</InputLabel>
                            <Select
                                value={filters.gender}
                                label="Giới tính"
                                onChange={(e) => handleFilterChange('gender', e.target.value)}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                {genders.map((g) => (
                                    <MenuItem key={g.value} value={g.value}>
                                        {g.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Kích thước */}
                        {sizes.length > 0 && (
                            <FormControl fullWidth>
                                <InputLabel>Kích thước</InputLabel>
                                <Select
                                    value={filters.size}
                                    label="Kích thước"
                                    onChange={(e) => handleFilterChange('size', e.target.value)}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {sizes.map((s) => (
                                        <MenuItem key={s} value={s}>
                                            {s}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Màu sắc */}
                        {colors.length > 0 && (
                            <FormControl fullWidth>
                                <InputLabel>Màu sắc</InputLabel>
                                <Select
                                    value={filters.color}
                                    label="Màu sắc"
                                    onChange={(e) => handleFilterChange('color', e.target.value)}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {colors.map((c) => (
                                        <MenuItem key={c} value={c}>
                                            {c}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Chất liệu */}
                        {materials.length > 0 && (
                            <FormControl fullWidth>
                                <InputLabel>Chất liệu</InputLabel>
                                <Select
                                    value={filters.material}
                                    label="Chất liệu"
                                    onChange={(e) => handleFilterChange('material', e.target.value)}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {materials.map((m) => (
                                        <MenuItem key={m} value={m}>
                                            {m}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Khoảng giá */}
                        <Box>
                            <Typography gutterBottom>Khoảng giá</Typography>
                            <Slider
                                value={filters.priceRange}
                                onChange={(e, val) => handleFilterChange('priceRange', val)}
                                valueLabelDisplay="auto"
                                min={0}
                                max={10000000}
                                step={100000}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography>{filters.priceRange[0].toLocaleString()}đ</Typography>
                                <Typography>{filters.priceRange[1].toLocaleString()}đ</Typography>
                            </Box>
                        </Box>

                        {/* Search */}
                        <TextField
                            fullWidth
                            label="Tìm kiếm sản phẩm"
                            value={filters.searchQuery}
                            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                        />
                    </Stack>
                </aside>

                {/* RIGHT PRODUCT LIST */}
                <section className={cx('right')}>
                    <Grid container spacing={2}>
                        {loading ? (
                            <Grid item xs={12}>
                                <Typography textAlign="center">Đang tải...</Typography>
                            </Grid>
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                                    <CardBody item={product} />
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Typography textAlign="center">Không tìm thấy sản phẩm phù hợp 😢</Typography>
                            </Grid>
                        )}
                    </Grid>
                </section>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Category;
