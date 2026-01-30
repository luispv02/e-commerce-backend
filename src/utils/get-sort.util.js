
const getSort = (order) => {
  switch (order) {
    case "price-asc":
      return { price: 1 };
    case "price-desc":
      return { price: -1 }
    case "newest":
      return { createdAt: -1 } ;
    case "oldest":
      return { createdAt: 1 };
    default:
      return { createdAt: 1 } ;
  }
};

module.exports = getSort;