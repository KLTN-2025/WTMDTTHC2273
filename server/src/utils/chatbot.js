require('dotenv').config();

const Groq = require('groq-sdk');
const modelProduct = require('../models/product.models');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 🔹 Bản đồ danh mục & giới tính
const CATEGORY_MAP = {
    ao: 'Áo',
    quan: 'Quần',
    vay: 'Váy',
    dam: 'Đầm',
    phu_kien: 'Phụ kiện',
    giay_dep: 'Giày dép',
    tui_xach: 'Túi xách',
};

const GENDER_MAP = {
    nam: 'Nam',
    nu: 'Nữ',
    unisex: 'Unisex',
};

// 🔹 Dịch category / gender
const translate = (value, map) => map[value] || value;

// 🔹 Phân tích intent (ý định câu hỏi)
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

// 🔹 Lọc sản phẩm theo nội dung
function filterProducts(products, question) {
    const q = question.toLowerCase();
    let result = [...products];

    const categoryKeywords = {
        ao: ['áo', 'ao'],
        quan: ['quần', 'quan'],
        vay: ['váy', 'vay'],
        dam: ['đầm', 'dam'],
        giay_dep: ['giày', 'dép'],
        tui_xach: ['túi', 'xách'],
        phu_kien: ['phụ kiện'],
    };

    for (const [key, values] of Object.entries(categoryKeywords)) {
        if (values.some((v) => q.includes(v))) {
            result = result.filter((p) => p.category === key);
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

    return result.slice(0, 10);
}

// 🔹 Format sản phẩm thành text cho AI
function formatProduct(product) {
    const attrs = product.attributes || {};
    const getAttr = (key) => attrs.get?.(key) || attrs[key] || 'Chưa có thông tin';

    return `- ${product.name}
  * Loại: ${translate(product.category, CATEGORY_MAP)} ${translate(product.gender, GENDER_MAP)}
  * Giá: ${product.price.toLocaleString('vi-VN')} VNĐ
  * Còn lại: ${product.stock} sản phẩm
  * Size: ${getAttr('size')}
  * Màu: ${getAttr('color')}
  * Chất liệu: ${getAttr('material')}
  * Thương hiệu: ${getAttr('brand')}
  * Mô tả: ${product.description || 'Chưa có mô tả'}`;
}

// 🔹 Tạo prompt gửi cho model
function buildPrompt(products, question) {
    const productInfo = products.map(formatProduct).join('\n\n');
    const intent = detectIntent(question);

    return `
Bạn là Minh – chuyên viên tư vấn bán hàng thời trang chuyên nghiệp và thân thiện.

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
- Sử dụng emoji phù hợp 😊
`;
}

// 🔹 Hàm chính xử lý câu hỏi
async function askQuestion(question) {
    try {
        const products = await modelProduct.find({});
        if (!products.length) return 'Xin lỗi, hiện tại shop chưa có sản phẩm nào. Vui lòng quay lại sau!';

        const filtered = filterProducts(products, question);

        // ✅ Nếu không có sản phẩm khớp loại mà KH hỏi
        if (filtered.length === 0) {
            const lower = question.toLowerCase();
            const categoryKeywords = {
                ao: ['áo', 'ao'],
                quan: ['quần', 'quan'],
                vay: ['váy', 'vay'],
                dam: ['đầm', 'dam'],
                giay_dep: ['giày', 'dép'],
                tui_xach: ['túi', 'xách'],
                phu_kien: ['phụ kiện'],
            };

            let askedCategory = null;
            for (const [key, values] of Object.entries(categoryKeywords)) {
                if (values.some((v) => lower.includes(v))) {
                    askedCategory = key;
                    break;
                }
            }

            if (askedCategory) {
                return `Dạ, hiện tại shop **chưa có sản phẩm ${translate(
                    askedCategory,
                    CATEGORY_MAP,
                )}** nào trong kho ạ. 🥺 Anh/chị có muốn xem các sản phẩm khác không?`;
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
