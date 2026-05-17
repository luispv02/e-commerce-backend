const formatOrder = (order) => {
  return {
    ...order,
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      pricePaid: Number(item.pricePaid),
    })),
  };
};

module.exports = formatOrder;
