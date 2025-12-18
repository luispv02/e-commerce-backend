const { Router } = require("express");
const { registerUser, loginUser, renewToken } = require("../controllers/auth.controller");
const { registerValidations, loginValidations } = require("../validators/auth.validator")

const validateFields = require("../middlewares/validate-fields.middleware");
const validateJWT = require("../middlewares/validate-jwt.middleware");

const router = Router();


router.post(
  '/register',
  [
    ...registerValidations,
    validateFields
  ],
  registerUser
)

router.post(
  '/login',
  [
    ...loginValidations,
    validateFields
  ],
  loginUser
)

router.post(
  '/renew',
  validateJWT,
  renewToken
)





module.exports = router;