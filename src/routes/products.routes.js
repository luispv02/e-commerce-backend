const { Router } = require("express");
const { createProduct } = require("../controllers/products.controller");

const multer  = require('multer');
const validateJWT = require("../middlewares/validate-jwt.middleware");
const { verifyAdmin } = require("../middlewares/verify-admin");
const validateFields = require("../middlewares/validate-fields.middleware");
const createProductValidations = require("../validators/product.validators");

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


const router = Router();


router.post(
  '/', 
  upload.array('files'),
  validateJWT,
  verifyAdmin,
  createProductValidations,
  validateFields,
  createProduct
)


module.exports = router