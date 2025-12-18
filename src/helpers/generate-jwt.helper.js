const jwt = require('jsonwebtoken');

const generateJWT = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
      if(err) reject('Error al generar token');
      resolve(token)
    })
  })
}

module.exports = generateJWT;