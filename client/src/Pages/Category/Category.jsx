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
    Button,
    Divider,
} from '@mui/material';
import { requestGetProducts, requestFilterProducts } from '../../config/request';
import CardBody from '../../Components/CardBody/CardBody';

import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

const cx = classNames.bind(styles);

function Category() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState([0, 10000000]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedOrigin, setSelectedOrigin] = useState('');
    const [loading, setLoading] = useState(false);

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

    const [selectedGender, setSelectedGender] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState('');

    const sortOptions = [
        { value: 'default', label: 'Mặc định' },
        { value: 'price_asc', label: 'Giá: Thấp đến cao' },
        { value: 'price_desc', label: 'Giá: Cao đến thấp' },
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await requestGetProducts();
                const productsData = Array.isArray(response.metadata) ? response.metadata : [];
                setProducts(productsData);
                setFilteredProducts(productsData);
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
                setFilteredProducts([]);
            }
        };
        fetchProducts();
    }, []);

    // Lấy danh sách thương hiệu và xuất xứ từ sản phẩm
    const brands = [...new Set(products.map((product) => product.attributes?.brand).filter(Boolean))];
    const origins = [...new Set(products.map((product) => product.attributes?.origin).filter(Boolean))];

    // Lấy danh sách các thuộc tính từ sản phẩm
    const sizes = [...new Set(products.map((product) => product.attributes?.size).filter(Boolean))];
    const colors = [...new Set(products.map((product) => product.attributes?.color).filter(Boolean))];
    const materials = [...new Set(products.map((product) => product.attributes?.material).filter(Boolean))];

    const fetchFilteredProducts = async () => {
        try {
            setLoading(true);
            const params = {
                category: selectedCategory,
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                searchQuery,
                brand: selectedBrand,
                gender: selectedGender,
                size: selectedSize,
                color: selectedColor,
                material: selectedMaterial,
                sortBy,
            };

            const response = await requestFilterProducts(params);
            setFilteredProducts(response.metadata);
        } catch (error) {
            console.error('Error filtering products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFilteredProducts();
    }, [
        selectedCategory,
        priceRange,
        searchQuery,
        sortBy,
        selectedBrand,
        selectedGender,
        selectedSize,
        selectedColor,
        selectedMaterial,
    ]);

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    const handleBrandChange = (event) => {
        setSelectedBrand(event.target.value);
    };

    const handleOriginChange = (event) => {
        setSelectedOrigin(event.target.value);
    };

    // Thêm handlers cho các bộ lọc mới
    const handleGenderChange = (event) => {
        setSelectedGender(event.target.value);
    };

    const handleSizeChange = (event) => {
        setSelectedSize(event.target.value);
    };

    const handleColorChange = (event) => {
        setSelectedColor(event.target.value);
    };

    const handleMaterialChange = (event) => {
        setSelectedMaterial(event.target.value);
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>
            <main className={cx('main')}>
                <div className={cx('left')}>
                    <Stack spacing={3} sx={{ p: 2 }}>
                        <Typography variant="h6">Bộ lọc</Typography>

                        <FormControl fullWidth>
                            <InputLabel>Sắp xếp theo</InputLabel>
                            <Select value={sortBy} label="Sắp xếp theo" onChange={handleSortChange}>
                                {sortOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider />

                        <FormControl fullWidth>
                            <InputLabel>Danh mục</InputLabel>
                            <Select value={selectedCategory} label="Danh mục" onChange={handleCategoryChange}>
                                <MenuItem value="">Tất cả</MenuItem>
                                {categories.map((category) => (
                                    <MenuItem key={category.value} value={category.value}>
                                        {category.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {brands.length > 0 && (
                            <FormControl fullWidth>
                                <InputLabel>Thương hiệu</InputLabel>
                                <Select value={selectedBrand} label="Thương hiệu" onChange={handleBrandChange}>
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {brands.map((brand) => (
                                        <MenuItem key={brand} value={brand}>
                                            {brand}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {origins.length > 0 && (
                            <FormControl fullWidth>
                                <InputLabel>Xuất xứ</InputLabel>
                                <Select value={selectedOrigin} label="Xuất xứ" onChange={handleOriginChange}>
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {origins.map((origin) => (
                                        <MenuItem key={origin} value={origin}>
                                            {origin}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <FormControl fullWidth>
                            <InputLabel>Giới tính</InputLabel>
                            <Select value={selectedGender} label="Giới tính" onChange={handleGenderChange}>
                                <MenuItem value="">Tất cả</MenuItem>
                                {genders.map((gender) => (
                                    <MenuItem key={gender.value} value={gender.value}>
                                        {gender.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {sizes.length > 0 && (
                            <FormControl fullWidth>
                                <InputLabel>Kích thước</InputLabel>
                                <Select value={selectedSize} label="Kích thước" onChange={handleSizeChange}>
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {sizes.map((size) => (
                                        <MenuItem key={size} value={size}>
                                            {size}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {colors.length > 0 && (
                            <FormControl fullWidth>
                                <InputLabel>Màu sắc</InputLabel>
                                <Select value={selectedColor} label="Màu sắc" onChange={handleColorChange}>
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {colors.map((color) => (
                                        <MenuItem key={color} value={color}>
                                            {color}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {materials.length > 0 && (
                            <FormControl fullWidth>
                                <InputLabel>Chất liệu</InputLabel>
                                <Select value={selectedMaterial} label="Chất liệu" onChange={handleMaterialChange}>
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {materials.map((material) => (
                                        <MenuItem key={material} value={material}>
                                            {material}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <Box>
                            <Typography gutterBottom>Khoảng giá</Typography>
                            <Slider
                                value={priceRange}
                                onChange={handlePriceChange}
                                valueLabelDisplay="auto"
                                min={0}
                                max={10000000}
                                step={100000}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography>{priceRange[0].toLocaleString()}đ</Typography>
                                <Typography>{priceRange[1].toLocaleString()}đ</Typography>
                            </Box>
                        </Box>

                        <TextField
                            fullWidth
                            label="Tìm kiếm sản phẩm"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </Stack>
                </div>

                <div className={cx('right')}>
                    <Grid container spacing={3} sx={{ p: 2 }}>
                        {loading ? (
                            <Grid item xs={12}>
                                <Typography>Đang tải...</Typography>
                            </Grid>
                        ) : (
                            Array.isArray(filteredProducts) &&
                            filteredProducts.map((product) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                                    <CardBody item={product} />
                                </Grid>
                            ))
                        )}
                    </Grid>
                </div>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Category;
