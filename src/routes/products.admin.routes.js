const { Router } = require("express");
const { createProduct, getAdminProducts, getAdminProductById, updateProduct } = require("../controllers/products.admin.controller");

const multer  = require('multer');
const validateJWT = require("../middlewares/validate-jwt.middleware");
const { verifyAdmin } = require("../middlewares/verify-admin");
const validateFields = require("../middlewares/validate-fields.middleware");
const { createProductValidations, updateProductValidations } = require("../validators/product.validator");

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

router.get(
  '/', 
  validateJWT,
  verifyAdmin,
  getAdminProducts
)

router.get(
  '/:id', 
  validateJWT,
  verifyAdmin,
  getAdminProductById
)

router.put(
  '/:id', 
  upload.array('files'),
  validateJWT,
  verifyAdmin,
  updateProductValidations,
  validateFields,
  updateProduct
)


module.exports = router