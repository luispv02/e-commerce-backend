
const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");
const CustomError = require("../utils/custom-error.util");


const getOrCreateCart = async(userId) => {
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] }},
    { new: true, upsert: true },
  )
  return cart;
};

const getCartWithProducts = async(userId) => {
  const cart = await getOrCreateCart(userId);
  await cart.populate('items.product');
  const validItems = cart.items.filter((item) => item.product !== null);

  if(validItems.length !== cart.items.length){
    cart.items = validItems;
    await cart.save()
  }
  
  return cart;
};

const addItem = async(userId, productId, quantity) => {
  
  if (quantity < 1) throw new CustomError('Cantidad inválida', 400);

  const product = await Product.findOne({_id: productId, isActive: true});
  if (!product) throw new CustomError('Producto no encontrado', 404);

  const cart = await getOrCreateCart(userId);

  const item = cart.items.find(item => item.product.toString() === productId);

  const currentQty = item ? item.quantity : 0;
  const newQuantity = currentQty + quantity;
  if(newQuantity > product.stock) throw new CustomError('Stock insuficiente', 400);

  if(item){
    item.quantity = newQuantity;
  }else{
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate('items.product');
  return cart;
};

const updateItem = async(userId, productId, quantity) => {

  if (quantity < 1) throw new CustomError('Cantidad inválida', 400);

  const cart = await getOrCreateCart(userId);

  const product = await Product.findOne({_id: productId, isActive: true});
  if (!product) throw new CustomError('Producto no encontrado o no disponible', 404);

  const item = cart.items.find((item) => item.product.toString() === productId);
  if (!item) throw new CustomError('Producto no encontrado en el carrito', 404);

  if (quantity > product.stock) throw new CustomError('Stock insuficiente', 400);
  item.quantity = quantity;

  await cart.save();
  await cart.populate('items.product');
  return cart;
};

const removeItem = async(userId, productId) => {

  const cart = await getOrCreateCart(userId);
  
  const item = cart.items.find((item) => item.product.toString() === productId);
  if (!item) throw new CustomError('Producto no encontrado en el carrito', 404);
    
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);

  await cart.save();
  await cart.populate('items.product');
  return cart;
};

module.exports = {
  getOrCreateCart,
  getCartWithProducts,
  addItem,
  updateItem,
  removeItem
};
