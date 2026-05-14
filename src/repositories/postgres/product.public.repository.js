const prisma = require("../../lib/prisma");

const findPublicProducts = async({ filters, sort, skip, limit }) => {

  return prisma.product.findMany({
    where: filters,
    orderBy: sort,
    skip,
    take: limit,
    include: {
      images: true
    }
  });
};

const countPublicProducts = (filters) => {
  return prisma.product.count({
    where: filters,
  });
};

const findActiveProductById = (productId) => {
  return prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
    include: {
      images: true
    },
  });
};

module.exports = {
  findPublicProducts,
  countPublicProducts,
  findActiveProductById,
};

