const { body } = require("express-validator");

const validateName = body('name')
  .trim()
  .isLength({ min: 2 })
  .withMessage('Nombre no valido')

const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Email no valido')


const registerValidations = [
  validateName,
  validateEmail,
  body('password')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
    .withMessage('Contraseña no valida')
]

const loginValidations = [
  validateEmail,
  body('password')
    .notEmpty()
    .withMessage('Contraseña requerida')
]

module.exports = {
  registerValidations,
  loginValidations
}