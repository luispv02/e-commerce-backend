const formatProduct = require("./format-product.helper");

const formatOrder = (order) => {
  return {
    ...order,
    total: Number(order.total),
    items: order.items.map((item) => ({
      productId: item.productId,
      title: item.title,
      description: item.description,
      images: item.images,
      quantity: item.quantity,
      pricePaid: Number(item.pricePaid),
      ...(item.variants && { variants: item.variants }),
      id: item.id,
    })),
  };
};

module.exports = formatOrder;
