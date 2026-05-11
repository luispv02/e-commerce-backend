const Cart = require("../../models/Cart.model");
const Product = require("../../models/Product.model");

const getCreateCart = (userId) => {
  return Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { new: true, upsert: true },
  );
};

const populateCartProducts = (cart) => {
  return cart.populate("items.product");
};

const saveCart = (cart) => {
  return cart.save();
};

module.exports = {
  getCreateCart,
  populateCartProducts,
  saveCart,
};
