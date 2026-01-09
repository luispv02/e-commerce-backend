const getPagination = require("../utils/get-pagination.util");
const getSort = require("../utils/get-sort.util");
const Product = require("../models/Product.model");
const getFilters = require("../helpers/get-filters.helper");


const getProducts = async(req, res) => {
  try {

    const { order, q, page = 1, limit=10 } = req.query;

    const filters = getFilters({...req.query, isAdmin: false})
    const sort = getSort(order);
    const { pageNum, limitNum, skip } = getPagination(page, limit);

    const [products, totalProducts] = await Promise.all([
      Product
        .find(filters, q ? { score: { $meta: "textScore" } } : {})
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filters)
    ])
    
    return res.status(200).json({
      ok: true,
      data: {
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalProducts: totalProducts,
          totalPages: Math.ceil(totalProducts / limitNum)
        },
        products
      }
    })

  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener productos'
    })
  }
}

module.exports = {
  getProducts
}