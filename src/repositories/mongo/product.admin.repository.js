const Product = require("../../models/Product.model");

const createProduct = (productData) => {
  const product = new Product(productData);
  return product.save();
};

const getAdminProducts = ({ filters, sort, skip, limit }) => {
  return Product
    .find(filters)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

const countAdminProducts = (filters) => {
  return Product.countDocuments(filters);
};

const findAdminProductById = (productId, userId) => {
  return Product.findOne({
    _id: productId,
    createdBy: userId,
  });
};

const saveProduct = (product) => {
  return product.save();
};

const deleteAdminProductById = (productId, userId) => {
  return Product.findOneAndDelete({
    _id: productId,
    createdBy: userId,
  });
};

module.exports = {
  createProduct,
  getAdminProducts,
  countAdminProducts,
  findAdminProductById,
  saveProduct,
  deleteAdminProductById,
};
