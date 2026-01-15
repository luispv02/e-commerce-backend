const authService = require('../services/auth.service');

const registerUser = async (req, res, next) => {
  try {
    const body = req.body;
    
    const data = await authService.registerUser(body)

    return res.status(201).json({
      ok: true,
      msg: 'Usuario registrado',
      data
    })
  } catch (error) {
    next(error)
  }
}

const loginUser = async (req, res, next) => {
  try {

    const body = req.body;

    const data = await authService.loginUser(body)

    return res.status(200).json({
      ok: true,
      data
    })

  } catch (error) {
    next(error)
  }
}

const renewToken = async (req, res, next) => {
  try {

    const user = req.user;

    const data = await authService.renewToken(user)

    return res.status(200).json({
      ok: true,
      msg: 'Token renovado',
      data
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  registerUser,
  loginUser,
  renewToken
}