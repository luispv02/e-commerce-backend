const Cart = require("../models/Cart.model");
const Order = require("../models/Order.model");
const Product = require("../models/Product.model");
const CustomError = require("../utils/custom-error.util");
const mongoose = require("mongoose")

const checkout = async (userId) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const cart = await Cart.findOne({ user: userId }).populate("items.product").session(session);
    if(!cart || cart.items.length === 0) {
      throw new CustomError('El carrito está vacío', 400);
    }

    let total = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) {
        throw new CustomError(`Producto no disponible`, 404);
      }

      if (item.quantity > product.stock) {
        throw new CustomError(`Stock insuficiente`, 400);
      }

      total += item.quantity * product.price;

      orderItems.push({
        productId: product._id,
        title: product.title,
        description: product.description,
        images: product.images,
        quantity: item.quantity,
        pricePaid: product.price,
      });
    }

    for (const item of cart.items) {
      const result = await Product.updateOne(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      );

      if (result.modifiedCount === 0) {
        throw new CustomError('Stock insuficiente durante el checkout', 400);
      }
    }

    const order = new Order({
      user: userId,
      items: orderItems,
      total,
    });

    await order.save({ session });

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
    checkout
};
