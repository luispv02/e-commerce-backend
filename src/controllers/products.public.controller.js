
const productService = require('../services/product.public.service');

const getProducts = async(req, res, next) => {
  try {

    const query = req.query;

    const data = await productService.getPublicProducts(query)

    return res.status(200).json({
      ok: true,
      data
    })

  } catch (error) {
    next(error)
  }
}

const getProductById = async(req, res, next) => {
  try {

    const productId = req.params.id;

    const product = await productService.getPublicProductById(productId)
    
    return res.status(200).json({
      ok: true,
      product
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getProducts,
  getProductById
}