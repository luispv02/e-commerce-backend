const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        msg: "Formato de token no válido"
      });
    }

    const token = authHeader.split(' ')[1];

    const { role } = jwt.verify(token, process.env.JWT_SECRET);
    if(role !== 'admin'){
      return res.status(401).json({
        ok: false,
        msg: 'No tiene permisos'
      })
    }
   
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
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

module.exports = { verifyAdmin }