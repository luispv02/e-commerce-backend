const CustomError = require("../utils/custom-error.util");
const getFilters = require("../helpers/get-filters.helper");
const getPagination = require("../utils/get-pagination.util");
const getSort = require("../utils/get-sort.util");
const { productPublicRepository } = require("../repositories/postgres");
const formatProduct = require("../helpers/format-product.helper");

const getPublicProducts = async(query) => {

  const { order, q, page = 1, limit = 10 } = query;

  const filters = getFilters({ ...query, isAdmin: false });
  const sort = getSort(order);
  const { pageNum, limitNum, skip } = getPagination(page, limit);

  const [products, totalProducts] = await Promise.all([
    productPublicRepository.findPublicProducts({
      filters,
      sort,
      skip,
      limit: limitNum
    }),
    productPublicRepository.countPublicProducts(filters),
  ]);

  return {
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalProducts: totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
    },
    products: products.map(formatProduct),
  };
};

const getPublicProductById = async (productId) => {
    
  const product = await productPublicRepository.findActiveProductById(productId);

  if(!product) throw new CustomError("Producto no encontrado", 404);

  return formatProduct(product);
};


module.exports = {
  getPublicProducts,
  getPublicProductById,
};