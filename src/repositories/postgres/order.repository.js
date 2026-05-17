const prisma = require("../../lib/prisma");

const getOrdersByUser = (userId) => {
  return prisma.order.findMany({
    where: {userId},
    include: { 
      items: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

const findCartWithProducts = (userId, tx) => {
  return tx.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });
};

const decreaseProductStock = async ({ productId, quantity, tx }) => {
  const result = await tx.product.updateMany({
    where: {
      id: productId,
      stock: {
        gte: quantity,
      },
    },
    data: {
      stock: {
        decrement: quantity,
      },
    },
  });

  return result.count > 0;
};

const createOrder = ({ userId, items, total, tx }) => {
  return tx.order.create({
    data: {
      userId,
      total,
      items: {
        create: items,
      },
    },
    include: {
      items: {
        select: {
          productId: true,
          title: true,
          description: true,
          images: true,
          quantity: true,
          pricePaid: true,
          variants: true,
          id: true,
        }
      },
      
    },
  });
};

const clearCart = async (cartId, tx) => {
  return tx.cartItem.deleteMany({ 
    where: { cartId } 
  });
};

module.exports = {
  getOrdersByUser,
  findCartWithProducts,
  decreaseProductStock,
  createOrder,
  clearCart
};
