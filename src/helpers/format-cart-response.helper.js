const formatResponseCartWithStock = (cart) => {
  
  const productCount = {};

  for(const item of cart.items) {
    const productId = item.product.id;
    productCount[productId] = (productCount[productId] || 0) + item.quantity;
  }

  const itemsWithStock = cart.items.map(item => {
    const productId = item.product.id;

    return {
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
      stockAvailable: item.product.stock - productCount[productId]
    };
  });

  return {
    ...cart,
    items: itemsWithStock
  };
}

module.exports = formatResponseCartWithStock;