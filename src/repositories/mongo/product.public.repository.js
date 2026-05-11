const Product = require("../../models/Product.model");

const findPublicProducts = ({ filters, sort, skip, limit, includeTextScore = false }) => {
  const projection = includeTextScore ? { score: { $meta: "textScore" } } : {};

  return Product.find(filters, projection)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

const countPublicProducts = (filters) => {
  return Product.countDocuments(filters);
};

const findActiveProductById = (productId) => {
  return Product.findOne({
    _id: productId,
    isActive: true,
  });
};

module.exports = {
  findPublicProducts,
  countPublicProducts,
  findActiveProductById,
};
