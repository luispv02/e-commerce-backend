const { orderRepository } = require("../repositories");
const CustomError = require("../utils/custom-error.util");

const checkout = async (userId) => {
  const session = await orderRepository.startSession();
  
  try {
    orderRepository.startTransaction(session);

    const cart = await orderRepository.findCartWithProducts(userId, session);
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

      const orderItem = {
        productId: product._id,
        title: product.title,
        description: product.description,
        images: product.images,
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
        productId: item.product._id,
        quantity: item.quantity,
        session,
      });

      if (!stockUpdated) {
        throw new CustomError('Stock insuficiente durante el checkout', 400);
      }
    }

    const order = await orderRepository.createOrder({
      userId,
      items: orderItems,
      total,
      session,
    });

    cart.items = [];
    await orderRepository.saveCart(cart, session);

    await orderRepository.commitTransaction(session);
    orderRepository.endSession(session);

    return order

  } catch (error) {
    await orderRepository.abortTransaction(session);
    orderRepository.endSession(session);
    throw error;
  }
};

module.exports = {
    checkout
};
