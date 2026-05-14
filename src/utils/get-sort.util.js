
const getSort = (order) => {
  switch (order) {
    case "price-asc":
      return { price: 'asc' };
    case "price-desc":
      return { price: 'desc' }
    case "newest":
      return { createdAt: 'desc' } ;
    case "oldest":
      return { createdAt: 'asc' };
    default:
      return { createdAt: 'asc' } ;
  }
};

module.exports = getSort;