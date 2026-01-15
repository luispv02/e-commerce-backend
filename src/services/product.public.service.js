const Product = require("../models/Product.model");
const CustomError = require("../utils/custom-error.util");
const getFilters = require("../helpers/get-filters.helper");
const getPagination = require("../utils/get-pagination.util");
const getSort = require("../utils/get-sort.util");

const getPublicProducts = async(query) => {

  const { order, q, page = 1, limit = 10 } = query;

  const filters = getFilters({ ...query, isAdmin: false });
  const sort = getSort(order);
  const { pageNum, limitNum, skip } = getPagination(page, limit);

  const [products, totalProducts] = await Promise.all([
    Product.find(filters, q ? { score: { $meta: "textScore" } } : {})
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filters),
  ]);

  return {
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalProducts: totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
    },
    products,
  };
};

const getPublicProductById = async (productId) => {
    
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if(!product) throw new CustomError("Producto no encontrado", 404);

  return product;
};


module.exports = {
  getPublicProducts,
  getPublicProductById,
};