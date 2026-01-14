const express = require('express');
const { dbConnection } = require('./config/db.config');
require('dotenv').config()

const auth = require('./routes/auth.routes');
const publicProducts = require('./routes/products.public.routes')
const adminProducts = require('./routes/products.admin.routes')
const cart = require('./routes/cart.routes')
const orders = require('./routes/order.routes');
const errorHandler = require('./middlewares/error-handler.middleware');
const CustomError = require('./utils/custom-error.util');


const app = express();

dbConnection();

app.use(express.json());

// Routes
app.use('/api/auth', auth)
app.use('/api/products', publicProducts)
app.use('/api/admin/products', adminProducts)
app.use('/api/cart', cart)
app.use('/api/orders', orders)



app.use('/{*splat}', (req, res, next) => {
  const error = new CustomError('Ruta no encontrada', 404)
  next(error);
});

app.use(errorHandler)

module.exports = app;