const mongoose = require("mongoose");
const Cart = require("../../models/Cart.model");
const Order = require("../../models/Order.model");
const Product = require("../../models/Product.model");

const startSession = async () => {
  return mongoose.startSession();
};

const startTransaction = (session) => {
  session.startTransaction();
};

const commitTransaction = async (session) => {
  return session.commitTransaction();
};

const abortTransaction = async (session) => {
  return session.abortTransaction();
};

const endSession = (session) => {
  return session.endSession();
};

const findCartWithProducts = async (userId, session) => {
  return Cart.findOne({ user: userId })
    .populate("items.product")
    .session(session);
};

const decreaseProductStock = async ({ productId, quantity, session }) => {
  const result = await Product.updateOne(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { session },
  );

  return result.modifiedCount > 0;
};

const createOrder = async ({ userId, items, total, session }) => {
  const order = new Order({
    user: userId,
    items,
    total,
  });

  return order.save({ session });
};

const saveCart = async (cart, session) => {
  return cart.save({ session });
};

module.exports = {
  startSession,
  startTransaction,
  commitTransaction,
  abortTransaction,
  endSession,
  findCartWithProducts,
  decreaseProductStock,
  createOrder,
  saveCart,
};
