const prisma = require("../../lib/prisma");

const productInclude = {
  images: {
    select: {
      id: true,
      url: true,
      publicId: true,
    },
  },
};

const createProduct = (data) => {
  return prisma.product.create({
    data,
    include: productInclude,
  });
};

const getAdminProducts = ({ filters, sort, skip, limit }) => {
  return prisma.product.findMany({
    where: filters,
    orderBy: sort,
    skip,
    take: limit,
    include: productInclude,
  });
};

const countAdminProducts = (filters) => {
  return prisma.product.count({
    where: filters,
  });
};

const findAdminProductById = (productId, userId) => {
  return prisma.product.findFirst({
    where: {
      id: productId,
      createdById: userId,
    },
    include: productInclude,
  });
};

const updateProduct = (productId, data) => {
  return prisma.product.update({
    where: {
      id: productId,
    },
    data,
    include: productInclude,
  });
};

const deleteAdminProductById = async (productId, userId) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      createdById: userId,
    },
    include: productInclude,
  });

  if (!product) return null;

  await prisma.product.delete({
    where: {
      id: productId,
    },
  });

  return product;
};

const deleteProductImages = (publicIds) => {
  return prisma.productImage.deleteMany({
    where: {
      publicId: {
        in: publicIds,
      },
    },
  });
};

module.exports = {
  createProduct,
  getAdminProducts,
  countAdminProducts,
  findAdminProductById,
  updateProduct,
  deleteAdminProductById,
  deleteProductImages,
};
