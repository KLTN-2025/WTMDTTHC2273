const userRoutes = require('./users.routes');
const productRoutes = require('./products.routes');
const cartRoutes = require('./cart.routes');
const paymentRoutes = require('./payments.routes');
const blogRoutes = require('./blogs.routes');
const contactRoutes = require('./contact.routes');
const couponRoutes = require('./coupon.routes');
const categoryRoutes = require('./category.routes');
const previewProductRoutes = require('./previewProduct.routes');

function routes(app) {
    app.use('/api', userRoutes);
    app.use('/api', productRoutes);
    app.use('/api', cartRoutes);
    app.use('/api', paymentRoutes);
    app.use('/api', blogRoutes);
    app.use('/api', contactRoutes);
    app.use('/api', couponRoutes);
    app.use('/api', previewProductRoutes);
    app.use('/api', categoryRoutes);
}

module.exports = routes;
