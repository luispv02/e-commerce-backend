const { Router } = require("express");
const validateJWT = require("../middlewares/validate-jwt.middleware");
const { getOrders } = require("../controllers/order.controller");


const router = Router();

router.use(validateJWT);

router.get('/', getOrders)


module.exports = router;

