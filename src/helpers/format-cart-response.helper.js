const formatResponseCartWithStock = (cart) => {
  
  const productCount = {};

  for(const item of cart.items) {
    const id = item.product._id.toString();
    productCount[id] = (productCount[id] || 0) + item.quantity;
  }

  const itemsWithStock = cart.items.map(item => {
    const id = item.product._id.toString();

    return {
      ...item.toJSON(),
      stockAvailable: item.product.stock - productCount[id]
    };
  });

  return {
    ...cart.toJSON(),
    items: itemsWithStock
  };
}

module.exports = formatResponseCartWithStock;