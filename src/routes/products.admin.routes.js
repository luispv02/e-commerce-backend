const { Router } = require("express");
const { createProduct, getAdminProducts, getAdminProductById, updateProduct, deleteProduct } = require("../controllers/products.admin.controller");

const multer  = require('multer');
const validateJWT = require("../middlewares/validate-jwt.middleware");
const { verifyAdmin } = require("../middlewares/verify-admin");
const validateFields = require("../middlewares/validate-fields.middleware");
const { createProductValidations, updateProductValidations } = require("../validators/product.validator");

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = Router();

router.use(validateJWT, verifyAdmin)

router.post(
  '/', 
  upload.array('files'),
  createProductValidations,
  validateFields,
  createProduct
)

router.get(
  '/',
  getAdminProducts
)

router.get(
  '/:id',
  getAdminProductById
)

router.put(
  '/:id', 
  upload.array('files'),
  updateProductValidations,
  validateFields,
  updateProduct
)

router.delete(
  '/:id',
  deleteProduct
)


module.exports = router