const jwt = require('jsonwebtoken');
const CustomError = require('../utils/custom-error.util');

const validateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new CustomError('Formato de token no válido', 401))
    }

    const token = authHeader.split(' ')[1];
    const { name, uid, role } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { name, uid, role }
    next()

  } catch (error) {
    if(error.name === 'TokenExpiredError'){
      return next(new CustomError('Token expirado', 401))
    }

    return next(new CustomError('Token no válido', 401))
  }
}


module.exports = validateJWT;