
const getFilters = ({category, price, sizes, gender, colors, type, brand, q, createdById, isAdmin = false}) => {

  const filters = {};

  if(isAdmin){
    if(createdById) filters.createdById = createdById;
  }else{
    filters.isActive = true
  }

  if (q && q.trim() !== "") {
    const cleanQ = q.trim().replace(/[^\w\s]/g, "").replace(/\s+/g, " ");
    const searchQuery = cleanQ.split(" ").map((term) => `${term}:*`).join(" & ");

    filters.OR = [
      { title: { search: searchQuery } },
      { description: { search: searchQuery } },
    ];  

  }

  if (category && category !== "all") filters.category = category;
  if (price) {
    const [min, max] = price.split("-").map(Number);
    filters.price = {};
    if (min) filters.price.gte = min;
    if (max) filters.price.lte = max;
  }

  if (type) {
    filters.type = { in: type.split(",") };
  }

  // Clothes
  if (category === "clothes") {
    if (sizes) {
      filters.sizes = { hasSome: sizes.split(",") }
    }
    if (gender) filters.gender = gender;
    if (colors) {
      filters.colors = { hasSome: colors.split(",") };
    }
  }

  // Technology
  if (category === "technology") {
    if (brand) {
      filters.brand = { in: brand.split(",") };
    }
  }

  return filters;
};

module.exports = getFilters;
