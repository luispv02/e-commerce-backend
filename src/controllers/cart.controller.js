
const cartService = require('../services/cart.service');
const orderService = require('../services/order.service')

const getCart = async(req, res, next) => {
  try {
    const userId = req.user.uid;

    const cart = await cartService.getCartWithProducts(userId);

    return res.status(200).json({
      ok: true,
      cart
    });
  } catch (error) {
    next(error)
  }
};

const addToCart = async(req, res, next) => {
  try {
    const userId = req.user.uid;
    const { productId, quantity = 1, variants } = req.body;
    
    const cart = await cartService.addItem(userId, productId, quantity, variants);

    return res.status(200).json({
      ok: true,
      msg: 'Producto agregado al carrito',
      cart
    });
  } catch (error) {
    next(error)
  }
};

const updateCartItem = async(req, res, next) => {
  try {
    const userId = req.user.uid;
    const cartItemId = req.params.id;
    const { quantity = 1 } = req.body;

    const cart = await cartService.updateItem(userId, cartItemId, quantity);

    return res.status(200).json({
      ok: true,
      msg: 'Producto actualizado',
      cart
    });
  } catch (error) {
    next(error)
  }
};

const removeCartItem = async(req, res, next) => {
  try {
    const userId = req.user.uid;
    const cartItemId = req.params.id;

    const cart = await cartService.removeItem(userId, cartItemId);

    return res.status(200).json({
      ok: true,
      msg: 'Producto eliminado',
      cart
    });
  } catch (error) {
    next(error)
  }
};

const checkout = async(req, res, next) => {
  try{

    const userId = req.user.uid;

    const order = await orderService.checkout(userId);

    return res.status(200).json({
      ok: true,
      msg: 'Compra realizada',
      order
    })
  }catch(error){
    next(error);
  }
}

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  checkout
};
