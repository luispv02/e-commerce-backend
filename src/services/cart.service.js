
const { cartRepository, productPublicRepository } = require("../repositories");
const CustomError = require("../utils/custom-error.util");
const formatResponseCartWithStock = require("../helpers/format-cart-response.helper");


const getCart = async (userId) => {
  let cart = await cartRepository.getCartByUserId(userId);
  if(!cart){
    return { 
      items: []
    };
  }

  const invalidItems = cart.items.filter((item) => item.product === null);
  if(invalidItems.length > 0){
    await cartRepository.deleteCartItems(invalidItems);
    cart = await cartRepository.getCartByUserId(userId);
  }
  return formatResponseCartWithStock(cart);
};

const addItem = async(userId, productId, quantity, variants) => {
  
  if (quantity < 1) throw new CustomError('Cantidad inválida', 400);

  const product = await productPublicRepository.findActiveProductById(productId);
  if (!product) throw new CustomError('Producto no encontrado', 404);

  const cart = await cartRepository.getOrCreateCart(userId);

  const item = cart.items.find(item => {
    const sameProduct = item.productId === productId;

    if(!variants) return sameProduct;

    return (sameProduct && item?.variants.color === variants.color && item?.variants.size === variants.size);
  });

  const totalQuantitySameProduct = cart.items
    .filter((item) => item.productId === productId)
    .reduce((acc, i) => i.quantity + acc, 0);

  const newUpdatedTotal = totalQuantitySameProduct + quantity;

  if(newUpdatedTotal > product.stock) throw new CustomError('Stock insuficiente', 400);

  if (item) {
    await cartRepository.updateCartItemQuantity(
      item.id,
      item.quantity + quantity,
    );
  } else {
    await cartRepository.createCartItem({
      cartId: cart.id,
      productId,
      quantity,
      variants,
    });
  }

  const updatedCart = await cartRepository.getCartByUserId(userId);

  return formatResponseCartWithStock(updatedCart);
};

const updateItem = async(userId, cartItemId, quantity) => {

  if (quantity < 1) throw new CustomError('Cantidad inválida', 400);

  const cart = await cartRepository.getCartByUserId(userId);
  if(!cart) { throw new CustomError("Carrito no encontrado", 404); }

  const itemInCart = cart.items.find((item) => item.id === cartItemId);
  if (!itemInCart) throw new CustomError('Producto no encontrado en el carrito', 404);

  const productId = itemInCart.product.id;
  const product = await productPublicRepository.findActiveProductById(productId);
  if (!product) throw new CustomError('Producto no encontrado o no disponible', 404);

  const totalQuantitySameProduct = cart.items
    .filter((item) => item.product.id === productId)
    .reduce((acc, i) => {
      if (i.id === cartItemId) {
        return acc + quantity;
      }
      return acc + i.quantity;
    }, 0);

  if (totalQuantitySameProduct > product.stock) {
    throw new CustomError('Stock insuficiente', 400);
  }

  await cartRepository.updateCartItemQuantity(cartItemId,quantity)

  const updatedCart = await cartRepository.getCartByUserId(userId);

  return formatResponseCartWithStock(updatedCart);
};

const removeItem = async(userId, cartItemId) => {

  const cart = await cartRepository.getCartByUserId(userId);
  if (!cart) { throw new CustomError('Carrito no encontrado', 404); }

  const item = cart.items.find((item) => item.id === cartItemId);
  if (!item) throw new CustomError('Producto no encontrado en el carrito', 404);

  await cartRepository.deleteCartItem(cartItemId)
  const updatedCart = await cartRepository.getCartByUserId(userId);

  return formatResponseCartWithStock(updatedCart);
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem
};
