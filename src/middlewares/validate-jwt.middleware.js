const jwt = require('jsonwebtoken');

const validateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        msg: "Formato de token no válido"
      });
    }

    const token = authHeader.split(' ')[1];
    const { name, uid, role } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { name, uid, role }
    next()

  } catch (error) {
    if(error.name === 'TokenExpiredError'){
      return res.status(401).json({
        ok: false,
        msg: 'Token expirado'
      })
    }

    return res.status(401).json({
      ok: false,
      msg: 'Token no válido'
    })
  }
}


module.exports = validateJWT;