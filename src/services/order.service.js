const prisma = require("../lib/prisma");
const formatOrder = require("../helpers/format-order.helper");
const { orderRepository } = require("../repositories");
const CustomError = require("../utils/custom-error.util");

const getUserOrders = async(userId) => {
  const orders =  await orderRepository.getOrdersByUser(userId);
  return orders.map(order => formatOrder(order))
}

const checkout = async (userId) => {
  return prisma.$transaction(async (tx) => {
    const cart = await orderRepository.findCartWithProducts(userId, tx);
    if(!cart || cart.items.length === 0) {
      throw new CustomError('El carrito está vacío', 400);
    }

    let total = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) {
        throw new CustomError("Producto no disponible", 404);
      }

      if (item.quantity > product.stock) {
        throw new CustomError("Stock insuficiente", 400);
      }

      total += Number(product.price) * item.quantity;

      const orderItem = {
        productId: product.id,
        title: product.title,
        description: product.description,
        images: product.images.map((img) => ({
          id: img.id,
          url: img.url,
          publicId: img.publicId,
        })),
        quantity: item.quantity,
        pricePaid: product.price,
      }

      const hasVariants = item.variants && (item.variants.color || item.variants.size);
      if (hasVariants) {
        orderItem.variants = item.variants;
      }

      orderItems.push(orderItem)
    }

    for (const item of cart.items) {
      const stockUpdated = await orderRepository.decreaseProductStock({ 
        productId: item.product.id,
        quantity: item.quantity,
        tx
      });

      if (!stockUpdated) {
        throw new CustomError('Stock insuficiente durante checkout', 400);
      }
    }

    const order = await orderRepository.createOrder({
      userId,
      items: orderItems,
      total,
      tx,
    });

    const formattedOrder = formatOrder(order)

    await orderRepository.clearCart(cart.id, tx);

    return formattedOrder;
  });

};

module.exports = {
  getUserOrders,
  checkout
};
