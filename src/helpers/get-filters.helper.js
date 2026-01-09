
const getFilters = ({category, price, sizes, gender, colors, type, brand, q, createdBy, isAdmin = false}) => {

  const filters = {};

  if(isAdmin){
    if(createdBy) filters.createdBy = createdBy;
  }else{
    filters.isActive = true
  }

  if (q && q.trim() !== "") {
    filters.$text = { $search: q };
  }

  if (category && category !== "all") filters.category = category;
  if (price) {
    const [min, max] = price.split("-").map(Number);
    filters.price = {};
    if (min) filters.price.$gte = min;
    if (max) filters.price.$lte = max;
  }

  // Clothes
  if (category === "clothes") {
    if (sizes) {
      filters.sizes = { $in: sizes.split(",") };
    }
    if (gender) filters.gender = gender;
    if (colors) {
      filters.colors = { $in: colors.split(",") };
    }
    if (type) {
      filters.type = { $in: type.split(",") };
    }
  }

  // Technology
  if (category === "technology") {
    if (type) {
      filters.type = { $in: type.split(",") };
    }
    if (brand) {
      filters.brand = { $in: brand.split(",") };
    }
  }

  return filters;
};

module.exports = getFilters;
