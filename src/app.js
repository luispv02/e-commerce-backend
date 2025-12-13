const express = require('express')

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Get Response');
});

module.exports = app;