const { Router } = require("express");
const { getProducts, getProductById } = require("../controllers/products.public.controller");

const router = Router();

router.get('/', getProducts)
router.get('/:id', getProductById)


module.exports = router