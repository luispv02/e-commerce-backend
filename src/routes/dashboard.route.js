const { Router } = require("express");
const { getDashboard } = require("../controllers/dashboard.controller");
const validateJWT = require("../middlewares/validate-jwt.middleware");
const { verifyAdmin } = require("../middlewares/verify-admin");

const router = Router();

router.use(validateJWT, verifyAdmin)

router.get('/', getDashboard)


module.exports = router;