import axios from 'axios';
import cookies from 'js-cookie';

const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

export const requestRegister = async (data) => {
    const res = await request.post('/api/register', data);
    return res.data;
};

export const requestAdmin = async () => {
    const res = await request.get('/api/admin');
    return res.data;
};

export const requestLogin = async (data) => {
    const res = await request.post('/api/login', data);
    return res.data;
};

export const requestCreateContact = async (data) => {
    const res = await request.post('/api/create-contact', data);
    return res.data;
};

export const requestGetContact = async () => {
    const res = await request.get('/api/get-contact');
    return res.data;
};

export const requestReplyContact = async (data) => {
    const res = await request.post(`/api/reply-contact`, data);
    return res.data;
};

export const requestAuth = async () => {
    const res = await request.get('/api/auth');
    return res.data;
};

export const requestLogout = async () => {
    const res = await request.get('/api/logout');
    return res.data;
};

export const requestRefreshToken = async () => {
    const res = await request.get('/api/refresh-token');
    return res.data;
};

export const requestChangePassword = async (data) => {
    const res = await request.post('/api/change-password', data);
    return res.data;
};

export const requestGetStatistic = async () => {
    const res = await request.get('/api/get-admin-stats');
    return res.data;
};

export const requestSendMailForgetPassword = async (email) => {
    const res = await request.post('/api/send-mail-forgot-password', email);
    return res.data;
};

export const requestResetPassword = async (data) => {
    const res = await request.post('/api/reset-password', data);
    return res.data;
};

export const requestGetAllUser = async () => {
    const res = await request.get('/api/get-all-users');
    return res.data;
};

export const requestEditRoleUser = async (data) => {
    const res = await request.post('/api/edit-role-user', data);
    return res.data;
};

export const requestEditUser = async (data) => {
    const res = await request.post('/api/edit-user', data);
    return res.data;
};

export const requestGetStatistics = async (params) => {
    const res = await request.get('/api/get-statistics', { params });
    return res.data;
};

/// product

export const requestCreateProduct = async (data) => {
    const res = await request.post('/api/create-product', data);
    return res.data;
};

export const requestGetProducts = async () => {
    const res = await request.get('/api/products');
    return res.data;
};

export const requestUploadImage = async (data) => {
    const res = await request.post('/api/upload-image', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const requestGetOneProduct = async (id) => {
    const res = await request.get('/api/product', { params: { id } });
    return res.data;
};

export const requestLoginGoogle = async (credential) => {
    const res = await request.post('/api/login-google', { credential });
    return res.data;
};

export const requestFilterProducts = async (params) => {
    const res = await request.get('/api/filter-products', { params });
    return res.data;
};

export const requestDeleteBlog = async (id) => {
    const res = await request.delete('/api/delete-blog', { params: { id } });
    return res.data;
};

export const requestGetAllProducts = async (data) => {
    const res = await request.get('/api/get-all-products', { params: data });
    return res.data;
};

export const requestEditProduct = async (data) => {
    const res = await request.post('/api/edit-product', data);
    return res.data;
};

export const requestDeleteProduct = async (id) => {
    const res = await request.delete('/api/delete-product', { params: { id } });
    return res.data;
};

export const requestSearchProduct = async (keyword) => {
    const res = await request.get('/api/search-product', { params: { keyword } });
    return res.data;
};

export const requestDeleteImage = async (id) => {
    const res = await request.post('/api/delete-image', { id });
    return res.data;
};

//// carts

export const requestAddCart = async (data) => {
    const res = await request.post('/api/add-cart', data);
    return res.data;
};

export const requestGetCart = async () => {
    const res = await request.get('/api/get-cart');
    return res.data;
};

export const requestDeleteProductCart = async (productId) => {
    console.log(productId);

    const res = await request.delete('/api/delete-product-cart', { params: { productId } });
    return res.data;
};

export const requestUpdateInfoUserCart = async (data) => {
    const res = await request.post('/api/update-info-user-cart', data);
    return res.data;
};

export const requestApplyCoupon = async (data) => {
    const res = await request.post('/api/apply-coupon', data);
    return res.data;
};

/// payments
export const requestPayment = async (data) => {
    const res = await request.post('/api/payments', data);
    return res.data;
};

export const requestGetPayment = async () => {
    const res = await request.get('/api/get-payment');
    return res.data;
};

export const requestGetOnePayment = async (id) => {
    const res = await request.get('/api/get-one-payment', { params: { id } });
    return res.data;
};

export const requestGetAllOrder = async (statusOrder) => {
    const res = await request.get('/api/get-all-order', { params: { statusOrder } });
    return res.data;
};

export const requestUpdateStatusOrder = async (data) => {
    const res = await request.post('/api/update-status-order', data);
    return res.data;
};

/// blogs
export const requestCreateBlog = async (data) => {
    const res = await request.post('/api/create-blog', data);
    return res.data;
};

export const requestGetBlogs = async () => {
    const res = await request.get('/api/blogs');
    return res.data;
};

export const requestGetBlog = async (id) => {
    const res = await request.get('/api/blog', { params: { id } });
    return res.data;
};

/// chatbot
export const requestChatbot = async (data) => {
    const res = await request.post('/chat', data);
    return res.data;
};

export const requestUpdateProfile = async (data) => {
    const res = await request.post('/api/update-profile', data);
    return res.data;
};

// coupun
export const requestGetAllCoupon = async () => {
    const res = await request.get('/api/coupons');
    return res.data;
};

export const requestCreateCoupon = async (data) => {
    const res = await request.post('/api/create-coupon', data);
    return res.data;
};

export const requestUpdateCoupon = async (data) => {
    const res = await request.post('/api/update-coupon', data);
    return res.data;
};

export const requestDeleteCoupon = async (id) => {
    const res = await request.delete('/api/delete-coupon', {
        params: {
            id,
        },
    });
    return res.data;
};

export const requestGetAllProductAdmin = async () => {
    const res = await request.get('/api/get-all-product-admin');
    return res.data;
};

/// preview product
export const requestCreatePreviewProduct = async (data) => {
    const res = await request.post('/api/create-preview-product', data);
    return res.data;
};

export const requestSubmitProductReview = async (data) => {
    const res = await request.post('/api/create-preview-product', data);
    return res.data;
};

export const requestGetPreviewProduct = async () => {
    const res = await request.get('/api/get-preview-product');
    return res.data;
};

let isRefreshing = false;
let failedRequestsQueue = [];

request.interceptors.response.use(
    (response) => response, // Trả về nếu không có lỗi
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và request chưa từng thử refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Gửi yêu cầu refresh token
                    const token = cookies.get('logged');
                    if (!token) {
                        return;
                    }
                    await requestRefreshToken();

                    // Xử lý lại tất cả các request bị lỗi 401 trước đó
                    failedRequestsQueue.forEach((req) => req.resolve());
                    failedRequestsQueue = [];
                } catch (refreshError) {
                    // Nếu refresh thất bại, đăng xuất
                    failedRequestsQueue.forEach((req) => req.reject(refreshError));
                    failedRequestsQueue = [];
                    localStorage.clear();
                    window.location.href = '/login'; // Chuyển về trang đăng nhập
                } finally {
                    isRefreshing = false;
                }
            }

            // Trả về một Promise để retry request sau khi token mới được cập nhật
            return new Promise((resolve, reject) => {
                failedRequestsQueue.push({
                    resolve: () => {
                        resolve(request(originalRequest));
                    },
                    reject: (err) => reject(err),
                });
            });
        }

        return Promise.reject(error);
    },
);
