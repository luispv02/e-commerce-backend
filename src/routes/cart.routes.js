const { Router } = require("express");
const { addToCart, getCart, updateCartItem, removeCartItem, checkout } = require("../controllers/cart.controller");
const validateJWT = require("../middlewares/validate-jwt.middleware");


const router = Router();

router.use(validateJWT);


router.get('/', getCart)
router.post('/', addToCart)
router.put('/:id', updateCartItem)
router.delete('/:id', removeCartItem)
router.post('/checkout', checkout);




module.exports = router;

