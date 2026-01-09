
const getPagination = (page = 1, limit = 10) => {
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(parseInt(limit) || 10, 50);
  const skip = (pageNum - 1) * limitNum;

  return {
    pageNum,
    limitNum,
    skip
  }
};

module.exports = getPagination;
