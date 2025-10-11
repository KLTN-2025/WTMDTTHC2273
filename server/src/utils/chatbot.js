const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyChaT4xn-_8XwXlpQ1flnP9q0LweFQd8FQ');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const modelProduct = require('../models/product.models');

async function askQuestion(question) {
    try {
        // Lấy dữ liệu sản phẩm
        const products = await modelProduct.find({});

        if (products.length === 0) {
            return 'Xin lỗi, hiện tại shop chưa có sản phẩm nào. Vui lòng quay lại sau!';
        }

        // Dịch category và gender
        const translateCategory = (category) => {
            const map = {
                ao: 'Áo',
                quan: 'Quần',
                vay: 'Váy',
                dam: 'Đầm',
                phu_kien: 'Phụ kiện',
                giay_dep: 'Giày dép',
                tui_xach: 'Túi xách',
            };
            return map[category] || category;
        };

        const translateGender = (gender) => {
            const map = { nam: 'Nam', nu: 'Nữ', unisex: 'Unisex' };
            return map[gender] || gender;
        };

        // Lọc sản phẩm theo câu hỏi
        const lowerQuestion = question.toLowerCase().trim();
        let filteredProducts = [...products];

        // Lọc theo danh mục
        if (lowerQuestion.includes('áo') || lowerQuestion.includes('ao')) {
            filteredProducts = filteredProducts.filter((p) => p.category === 'ao');
        } else if (lowerQuestion.includes('quần') || lowerQuestion.includes('quan')) {
            filteredProducts = filteredProducts.filter((p) => p.category === 'quan');
        } else if (lowerQuestion.includes('váy') || lowerQuestion.includes('vay')) {
            filteredProducts = filteredProducts.filter((p) => p.category === 'vay');
        } else if (lowerQuestion.includes('đầm') || lowerQuestion.includes('dam')) {
            filteredProducts = filteredProducts.filter((p) => p.category === 'dam');
        } else if (lowerQuestion.includes('giày') || lowerQuestion.includes('dép')) {
            filteredProducts = filteredProducts.filter((p) => p.category === 'giay_dep');
        } else if (lowerQuestion.includes('túi') || lowerQuestion.includes('xách')) {
            filteredProducts = filteredProducts.filter((p) => p.category === 'tui_xach');
        } else if (lowerQuestion.includes('phụ kiện')) {
            filteredProducts = filteredProducts.filter((p) => p.category === 'phu_kien');
        }

        // Lọc theo giới tính
        if (lowerQuestion.includes('nam')) {
            filteredProducts = filteredProducts.filter((p) => p.gender === 'nam' || p.gender === 'unisex');
        } else if (lowerQuestion.includes('nữ') || lowerQuestion.includes('nu')) {
            filteredProducts = filteredProducts.filter((p) => p.gender === 'nu' || p.gender === 'unisex');
        }

        // Lọc theo giá
        if (lowerQuestion.includes('rẻ') || lowerQuestion.includes('giá thấp')) {
            filteredProducts = filteredProducts.sort((a, b) => a.price - b.price).slice(0, 10);
        } else if (lowerQuestion.includes('đắt') || lowerQuestion.includes('cao cấp')) {
            filteredProducts = filteredProducts.sort((a, b) => b.price - a.price).slice(0, 10);
        }

        // Format dữ liệu sản phẩm
        const productData = filteredProducts
            .slice(0, 10)
            .map((product) => {
                const size = product.attributes?.get('size') || 'Chưa có thông tin';
                const color = product.attributes?.get('color') || 'Chưa có thông tin';
                const material = product.attributes?.get('material') || 'Chưa có thông tin';
                const brand = product.attributes?.get('brand') || 'Chưa có thông tin';

                return `- ${product.name}
              * Loại: ${translateCategory(product.category)} ${translateGender(product.gender)}
              * Giá: ${product.price.toLocaleString('vi-VN')} VNĐ
              * Còn lại: ${product.stock} sản phẩm
              * Size: ${size}
              * Màu: ${color}
              * Chất liệu: ${material}
              * Thương hiệu: ${brand}
              * Mô tả: ${product.description || 'Chưa có mô tả'}`;
            })
            .join('\n\n');

        // Phân tích ý định khách hàng
        let intentPrompt = '';
        if (lowerQuestion.includes('tìm') || lowerQuestion.includes('có') || lowerQuestion.includes('show')) {
            intentPrompt =
                'Nhiệm vụ: Giúp khách hàng tìm sản phẩm phù hợp. Đề xuất 3-5 sản phẩm tốt nhất và giải thích tại sao phù hợp.';
        } else if (lowerQuestion.includes('giá') || lowerQuestion.includes('bao nhiêu')) {
            intentPrompt = 'Nhiệm vụ: Tư vấn về giá cả. Cung cấp thông tin giá chính xác và so sánh các sản phẩm.';
        } else if (lowerQuestion.includes('khuyến mãi') || lowerQuestion.includes('giảm giá')) {
            intentPrompt =
                'Nhiệm vụ: Thông báo khuyến mãi. Hiện shop có giảm giá 20% cho khách mới và free ship đơn từ 500k.';
        } else if (lowerQuestion.includes('giao hàng') || lowerQuestion.includes('ship')) {
            intentPrompt = 'Nhiệm vụ: Shop giao toàn quốc 1-3 ngày, free ship từ 500k, hỗ trợ COD.';
        } else if (lowerQuestion.includes('đổi trả') || lowerQuestion.includes('bảo hành')) {
            intentPrompt = 'Nhiệm vụ: Đổi trả trong 7 ngày nếu lỗi, giữ nguyên tem mác, đổi size free trong 3 ngày.';
        } else {
            intentPrompt = 'Nhiệm vụ: Tư vấn tổng quát và hướng dẫn khách hàng mua hàng.';
        }

        const prompt = `
        Bạn là Minh - chuyên viên tư vấn bán hàng thời trang chuyên nghiệp và thân thiện.
        
        THÔNG TIN SẢN PHẨM:
        ${productData}
        
        CÂU HỎI KHÁCH HÀNG: "${question}"
        
        ${intentPrompt}
        
        LƯU Ý:
        - Gọi khách hàng bằng "anh/chị"
        - Thái độ thân thiện, chuyên nghiệp
        - Kết thúc bằng câu hỏi để tiếp tục tương tác
        - Không bịa đặt thông tin không có
        - Sử dụng emoji phù hợp 😊
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.log(error);
        return 'Xin lỗi anh/chị, hệ thống đang gặp sự cố. Vui lòng thử lại sau! 😅';
    }
}

module.exports = { askQuestion };
