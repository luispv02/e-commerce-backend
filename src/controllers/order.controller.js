const Order = require("../models/Order.model");

const getOrders = async(req, res, next) => {
  try {
    const userId = req.user.uid;
    const orders = await Order.find({ user: userId }).populate("items.product");

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
