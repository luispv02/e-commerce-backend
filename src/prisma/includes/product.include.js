const productInclude = {
  images: {
    select: {
      id: true,
      url: true,
      publicId: true,
    },
  },
};

module.exports = productInclude;