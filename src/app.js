const express = require('express');
const { dbConnection } = require('./config/db.config');
require('dotenv').config()

const auth = require('./routes/auth.routes');
const products = require('./routes/products.routes')
const app = express();

dbConnection();

app.use(express.json());

// Routes
app.use('/api/auth', auth)
app.use('/api/products', products)


app.use('/{*splat}', (req, res) => {
  res.status(404).json({
    ok: false,
    msg: 'Ruta no encontrada',
  });
});

module.exports = app;