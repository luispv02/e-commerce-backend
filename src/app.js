const express = require('express');
const { dbConnection } = require('./config/db.config');
require('dotenv').config()

const app = express();

dbConnection();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Get Response');
});

module.exports = app;