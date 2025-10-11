import App from '../App';
import Checkout from '../Pages/Checkout/Checkout';
import LoginUser from '../Pages/Login/LoginUser';
import RegisterUser from '../Pages/Register/RegisterUser';
import InfoUser from '../Pages/InfoUser/InfoUser';
import DashBroad from '../Pages/Admin/DashBroad';
import DetailProduct from '../Pages/DetailProduct/DetailProduct';
import CartUser from '../Pages/Cart/Cart';
import Payments from '../Pages/payments/payments';
import Category from '../Pages/Category/Category';
import Blogs from '../Pages/Blogs/Blogs';
import DetailBlog from '../Pages/DetailBlog/DetailBlog';
import ForgotPassword from '../Pages/ForgotPassword/ForgotPassword';
import Contact from '../Pages/Contact/Contact';

export const publicRoutes = [
    {
        path: '/',
        component: <App />,
    },
    {
        path: '/login',
        component: <LoginUser />,
    },
    {
        path: '/register',
        component: <RegisterUser />,
    },
    {
        path: '/checkout',
        component: <Checkout />,
    },
    {
        path: '/forgot-password',
        component: <ForgotPassword />,
    },
    {
        path: '/bai-viet/:id',
        component: <DetailBlog />,
    },
    {
        path: '/info',
        component: <InfoUser />,
    },
    {
        path: '/contact',
        component: <Contact />,
    },
    {
        path: '/product/:id',
        component: <DetailProduct />,
    },
    {
        path: '/payment/:id',
        component: <Payments />,
    },
    {
        path: '/cart',
        component: <CartUser />,
    },
    {
        path: '/blog',
        component: <Blogs />,
    },
    {
        path: '/category',
        component: <Category />,
    },
    {
        path: '/admin',
        component: <DashBroad />,
    },
];
