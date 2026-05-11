
const { cartRepository, productPublicRepository } = require("../repositories");
const CustomError = require("../utils/custom-error.util");
const formatResponseCartWithStock = require("../helpers/format-cart-response.helper");


const getOrCreateCart = async(userId) => {
  return await cartRepository.getCreateCart(userId);
};

const getCartWithProducts = async(userId) => {
  const cart = await getOrCreateCart(userId);
  await cartRepository.populateCartProducts(cart);
  const validItems = cart.items.filter((item) => item.product !== null);

  if(validItems.length !== cart.items.length){
    cart.items = validItems;
    await cartRepository.saveCart(cart)
  }
  const cartWithStock = formatResponseCartWithStock(cart);
  return cartWithStock;
};

const addItem = async(userId, productId, quantity, variants) => {
  
  if (quantity < 1) throw new CustomError('Cantidad inválida', 400);

  const product = await productPublicRepository.findActiveProductById(productId);
  if (!product) throw new CustomError('Producto no encontrado', 404);

  const cart = await getOrCreateCart(userId);

  const item = cart.items.find(item => {
    const sameProduct = item.product.equals(productId)

    if(!variants) return sameProduct;

    return (sameProduct && item?.variants.color === variants.color && item?.variants.size === variants.size);
  });

  const totalQuantitySameProduct = cart.items.filter((item) => item.product.equals(productId)).reduce((acc, i) => i.quantity + acc ,0);
  const newUpdatedTotal = totalQuantitySameProduct + quantity;

  if(newUpdatedTotal > product.stock) throw new CustomError('Stock insuficiente', 400);

  if(item){
    item.quantity += quantity;
  }else{
    const newProduct = {
      product: productId,
      quantity
    };

    if (variants) {
      newProduct.variants = {
        color: variants.color,
        size: variants.size
      };
    }
    cart.items.push(newProduct);
  }

  await cartRepository.saveCart(cart);
  await cartRepository.populateCartProducts(cart);

  const cartWithStock = formatResponseCartWithStock(cart);
  return cartWithStock;
};

const updateItem = async(userId, cartItemId, quantity) => {

  if (quantity < 1) throw new CustomError('Cantidad inválida', 400);

  const cart = await getOrCreateCart(userId);

  const itemInCart = cart.items.find(item => item._id.toString() === cartItemId);
  if (!itemInCart) throw new CustomError('Producto no encontrado en el carrito', 404);

  const productId = itemInCart.product.toString();

  const product = await productPublicRepository.findActiveProductById(productId);
  if (!product) throw new CustomError('Producto no encontrado o no disponible', 404);

  const totalQuantitySameProduct = cart.items
  .filter(item => item.product.toString() === productId)
  .reduce((acc, i) => {
    if (i._id.toString() === cartItemId) {
      return acc + quantity;
    }
    return acc + i.quantity;
  }, 0);

  if (totalQuantitySameProduct > product.stock) {
    throw new CustomError('Stock insuficiente', 400);
  }

  itemInCart.quantity = quantity;

  await cartRepository.saveCart(cart);
  await cartRepository.populateCartProducts(cart);

  const cartWithStock = formatResponseCartWithStock(cart);
  return cartWithStock;
};

const removeItem = async(userId, cartItemId) => {

  const cart = await getOrCreateCart(userId);
  
  const item = cart.items.find((item) => item._id.toString() === cartItemId);
  if (!item) throw new CustomError('Producto no encontrado en el carrito', 404);
    
  cart.items = cart.items.filter((item) => item._id.toString() !== cartItemId);

  await cartRepository.saveCart(cart);
  await cartRepository.populateCartProducts(cart);

  const cartWithStock = formatResponseCartWithStock(cart);
  return cartWithStock;
};

module.exports = {
  getOrCreateCart,
  getCartWithProducts,
  addItem,
  updateItem,
  removeItem
};
