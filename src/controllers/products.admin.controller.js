
const productService = require('../services/product.admin.service');

const createProduct = async(req, res, next) => {
  try {
    
    const files = req.files || [];

    const product = await productService.createProduct(req.body, files, req.user.uid)
    
    return res.status(201).json({
      ok: true,
      msg: 'Producto creado',
      product
    })

  } catch (error) {
    next(error);
  }
}

const getAdminProducts = async(req, res, next) => {
  try {

    const query = req.query;
    const userId = req.user.uid;

    const data = await productService.getAdminProducts(query, userId)

    return res.status(200).json({
      ok: true,
      data
    })
  } catch (error) {
    next(error)
  }
}

const getAdminProductById = async(req, res, next) => {
  try{

    const productId = req.params.id;
    const userId = req.user.uid;

    const product = await productService.getAdminProductById(productId, userId)

    return res.status(200).json({
      ok: true,
      product
    })

  }catch(error){
    next(error)
  }
}

const updateProduct = async(req, res, next) => {
  try{
    const productId = req.params.id;
    const userId = req.user.uid;
    const files = req.files || [];

    const updatedProduct = await productService.updateProduct(productId, userId, req.body, files)

    return res.status(200).json({
      ok: true,
      msg: 'Producto actualizado',
      product: updatedProduct
    })
  }catch(error){
    next(error)
  }
}

const deleteProduct = async(req, res, next) => {
  try{
    const productId = req.params.id;
    const userId = req.user.uid;

    const productDeleted = await productService.deleteProduct(productId, userId)
    return res.status(200).json({
      ok: true,
      msg: 'Producto eliminado',
      product: productDeleted
    });

  }catch(error){
    next(error)
  }
}

module.exports = {
  createProduct,
  getAdminProducts,
  getAdminProductById,
  updateProduct,
  deleteProduct
}