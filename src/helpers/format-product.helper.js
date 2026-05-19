const formatProduct = (product) => {
  if (!product) return null;

  return {
    ...product,
    price: Number(product.price),
  };
};

module.exports = formatProduct;
