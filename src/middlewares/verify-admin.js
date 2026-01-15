const CustomError = require("../utils/custom-error.util");

const verifyAdmin = (req, res, next) => {
  
  if (!req.user) {
    return next(new CustomError('Token no válido', 401))
  }

  if (req.user.role !== 'admin') {
    return next(new CustomError('No tiene permisos de administrador', 403))
  }

  next();
};

module.exports = { verifyAdmin };