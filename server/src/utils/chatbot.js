const Groq = require('groq-sdk'); // Import Groq
const modelCategory = require('../models/category.model'); // Import model Category
const modelProduct = require('../models/product.models'); // Import model Product

// Initialize Groq with your API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 🔹 Dịch giới tính
const GENDER_MAP = {
    nam: 'Nam',
    nu: 'Nữ',
    unisex: 'Unisex',
};

// 🔹 Dịch category / gender
function translate(value, map) {
    return map[value] || value; // Translate the category or gender using the provided map
}

// 🔹 Lọc sản phẩm theo nội dung
async function filterProducts(products, question) {
    const q = question.toLowerCase(); // Chuyển câu hỏi sang chữ thường
    let result = [...products];

    // Lấy tất cả danh mục từ cơ sở dữ liệu
    const categories = await modelCategory.find({});
    const categoryKeywords = categories.reduce((map, category) => {
        map[category.categoryName.toLowerCase()] = category._id; // Gán categoryName thành ID và chuyển thành chữ thường
        return map;
    }, {});

    // Tìm category phù hợp với câu hỏi (dựa trên categoryName)
    for (const [key, categoryId] of Object.entries(categoryKeywords)) {
        if (q.includes(key)) {
            // Kiểm tra nếu câu hỏi có chứa tên danh mục
            result = result.filter((p) => p.categoryId.toString() === categoryId.toString());
            break;
        }
    }

    // Lọc giới tính
    if (q.includes('nam')) {
        result = result.filter((p) => ['nam', 'unisex'].includes(p.gender));
    } else if (q.includes('nữ') || q.includes('nu')) {
        result = result.filter((p) => ['nu', 'unisex'].includes(p.gender));
    }

    // Lọc giá
    if (/rẻ|giá thấp/.test(q)) {
        result.sort((a, b) => a.price - b.price);
    } else if (/đắt|cao cấp/.test(q)) {
        result.sort((a, b) => b.price - a.price);
    }

    return result.slice(0, 10); // Giới hạn kết quả trả về
}

// 🔹 Format sản phẩm thành text cho AI
function formatProduct(product) {
    const getAttr = (key) => product[key] || 'Chưa có thông tin'; // Trực tiếp lấy các thuộc tính trong sản phẩm

    return `- ${product.name}
  * Loại: ${translate(product.category, GENDER_MAP)} ${translate(product.gender, GENDER_MAP)}
  * Giá: ${product.price.toLocaleString('vi-VN')} VNĐ
  * Còn lại: ${product.stock} sản phẩm
  * Size: ${getAttr('size')}
  * Màu: ${getAttr('color')}
  * Chất liệu: ${getAttr('material')}
  * Thương hiệu: ${getAttr('brand')}
  * Mô tả: ${product.description || 'Chưa có mô tả'}`;
}

// 🔹 Hàm detectIntent - Nhận diện ý định của khách hàng từ câu hỏi
function detectIntent(question) {
    const q = question.toLowerCase();
    if (/tìm|có|show/.test(q)) return 'Giúp khách hàng tìm sản phẩm phù hợp. Đề xuất 3–5 sản phẩm và giải thích lý do.';
    if (/giá|bao nhiêu/.test(q)) return 'Tư vấn về giá cả, cung cấp thông tin chính xác và so sánh sản phẩm.';
    if (/khuyến mãi|giảm giá/.test(q)) return 'Thông báo khuyến mãi: Giảm 20% cho khách mới, freeship đơn từ 500k.';
    if (/giao hàng|ship/.test(q))
        return 'Giải thích chính sách giao hàng: Toàn quốc 1–3 ngày, freeship đơn từ 500k, hỗ trợ COD.';
    if (/đổi trả|bảo hành/.test(q))
        return 'Thông tin đổi trả: 7 ngày nếu lỗi, giữ nguyên tem mác, đổi size miễn phí trong 3 ngày.';
    return 'Tư vấn tổng quát và hướng dẫn khách hàng mua hàng.';
}

// 🔹 Tạo prompt gửi cho model
function buildPrompt(products, question) {
    const productInfo = products.map(formatProduct).join('\n\n');
    const intent = detectIntent(question); // Định nghĩa hàm detectIntent ở dưới

    return `Bạn là Minh – chuyên viên tư vấn bán hàng thời trang chuyên nghiệp và thân thiện.

            THÔNG TIN SẢN PHẨM:
            ${productInfo}

            CÂU HỎI KHÁCH HÀNG: "${question}"

            NHIỆM VỤ:
            ${intent}

            LƯU Ý:
            - Gọi khách hàng bằng "anh/chị"
            - Giọng điệu thân thiện, chuyên nghiệp
            - Kết thúc bằng câu hỏi để tiếp tục tương tác
            - Không bịa đặt thông tin không có
            - Sử dụng emoji phù hợp 😊`;
}

// 🔹 Hàm chính xử lý câu hỏi
async function askQuestion(question) {
    try {
        const products = await modelProduct.find({}); // Lấy tất cả sản phẩm
        if (!products.length) return 'Xin lỗi, hiện tại shop chưa có sản phẩm nào. Vui lòng quay lại sau!';

        const filtered = await filterProducts(products, question); // Lọc sản phẩm dựa trên câu hỏi

        // ✅ Nếu không có sản phẩm khớp loại mà KH hỏi
        if (filtered.length === 0) {
            const lower = question.toLowerCase();
            const categories = await modelCategory.find({});
            const categoryKeywords = categories.reduce((map, category) => {
                map[category.categoryName.toLowerCase()] = category._id;
                return map;
            }, {});

            let askedCategory = null;
            for (const [key, categoryId] of Object.entries(categoryKeywords)) {
                if (lower.includes(key)) {
                    // Kiểm tra xem có từ khóa danh mục trong câu hỏi không
                    askedCategory = key;
                    break;
                }
            }

            if (askedCategory) {
                return `Dạ, hiện tại shop **chưa có sản phẩm ${askedCategory}** nào trong kho ạ. 🥺 Anh/chị có muốn xem các sản phẩm khác không?`;
            }
        }

        // ✅ Nếu có sản phẩm → xây prompt cho AI
        const prompt = buildPrompt(filtered, question);

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'Bạn là chuyên viên tư vấn bán hàng thân thiện, chuyên nghiệp, tên Minh.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
        });

        return completion.choices[0]?.message?.content || 'Xin lỗi, tôi chưa hiểu câu hỏi của anh/chị 😅';
    } catch (error) {
        console.error('[Chatbot Error]', error);
        return 'Xin lỗi anh/chị, hệ thống đang gặp sự cố. Vui lòng thử lại sau! 😅';
    }
}

module.exports = { askQuestion };
