const { getUserOrders } = require("../services/order.service");

const getOrders = async(req, res, next) => {
  try {
    const userId = req.user.uid;
    const orders = await getUserOrders(userId)

    return res.status(200).json({
      ok: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
};
