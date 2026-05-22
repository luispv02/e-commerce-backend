const prisma = require("../../lib/prisma");
const productInclude = require("../../prisma/includes/product.include");


const findPublicProducts = async({ filters, sort, skip, limit }) => {

  return prisma.product.findMany({
    where: filters,
    orderBy: sort,
    skip,
    take: limit,
    include: productInclude
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
    include: productInclude
  });
};

module.exports = {
  findPublicProducts,
  countPublicProducts,
  findActiveProductById,
};

