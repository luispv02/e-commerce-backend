const formatProduct = (product) => {
  if (!product) return null;

  const { id, title, price, description, stock, category, images, isActive, createdById, createdAt, updatedAt } = product;

  const baseProduct = {
    id,
    title,
    price: Number(price),
    description,
    stock,
    category,
    images,
    isActive,
    createdBy: createdById,
    createdAt,
    updatedAt,
  };

  switch (product.category) {
    case "clothes":
      return {
        ...baseProduct,
        sizes: product.sizes,
        gender: product.gender,
        colors: product.colors,
        type: product.type,
      };

    case "technology":
      return {
        ...baseProduct,
        brand: product.brand,
        type: product.type,
      };

    default:
      return baseProduct;
  }
};

module.exports = formatProduct;
