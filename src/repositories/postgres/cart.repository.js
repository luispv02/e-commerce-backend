const prisma = require("../../lib/prisma");
const productInclude = require("../../prisma/includes/product.include");

const getOrCreateCart = (userId) => {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          product: {
            include: productInclude
          },
        },
      },
    },
  });
};

const getCartByUserId = (userId) => {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          quantity: true,
          variants: true,
          product: {
            include: productInclude
          },
        },
      },
    },
  });
};

const createCartItem = ({ cartId, productId, quantity, variants }) => {
  return prisma.cartItem.create({
    data: { cartId, productId, quantity, variants },
  });
};

const updateCartItemQuantity = (cartItemId, quantity) => {
  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
};

const deleteCartItem = (cartItemId) => {
  return prisma.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });
};

const deleteCartItems = (invalidItems) => {
  return prisma.cartItem.deleteMany({
    where: {
      id: {
        in: invalidItems.map((item) => item.id),
      },
    },
  });
};

module.exports = {
  getOrCreateCart,
  getCartByUserId,
  createCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  deleteCartItems,
};
