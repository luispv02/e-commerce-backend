const getFilters = require("../helpers/get-filters.helper");
const { uploadFiles } = require("../helpers/upload-files.helper");
const Product = require("../models/Product.model");
const CustomError = require("../utils/custom-error.util");
const getPagination = require("../utils/get-pagination.util");
const getSort = require("../utils/get-sort.util");
const cloudinary = require('../config/cloudinary.config');

const createProduct = async(data, files = [], userId) => {

  const {title, price, description, stock, category, sizes, gender, colors, type, brand} = data;

  let imgUrls = [];
  if (files.length > 0) {
    imgUrls = await uploadFiles(files);
  }

  const productData = {
    title,
    price,
    description,
    stock,
    category,
    images: imgUrls,
    createdBy: userId,
  };

  if (category === "clothes") {
    productData.sizes = sizes;
    productData.gender = gender;
    productData.colors = colors;
    productData.type = type;
  }

  if (category === "technology") {
    productData.brand = brand;
    productData.type = type;
  }

  const newProduct = new Product(productData);
  await newProduct.save();

  return newProduct;
};

const getAdminProducts = async(query, userId) => {

  const { order, page = 1, limit = 10 } = query;

  const filters = getFilters({ ...query, createdBy: userId, isAdmin: true });
  const sort = getSort(order);
  const { pageNum, limitNum, skip } = getPagination(page, limit);

  const [products, totalProducts] = await Promise.all([
    Product
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filters),
  ]);


  return {
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalProducts: totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
    },
    products,
  };
};

const getAdminProductById = async(productId, userId) => {

  const product = await Product.findOne({
    _id: productId,
    createdBy: userId
  });

  if (!product) throw new CustomError('Producto no encontrado', 404);

  return product;
};

const updateProduct = async(productId, userId, body, files) => {
  const { deletedImages, ...updatedFields } = body;

  let updateData = {
    $set: { ...updatedFields },
  };

  // Add new images
  if (files.length > 0) {
    const urlFiles = await uploadFiles(files);

    updateData.$push = {
      images: { $each: urlFiles },
    };
  }

  // delete saved images
  if (deletedImages) {
    const imagesToDelete = JSON.parse(deletedImages);

    if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
      updateData.$pull = {
        images: {
          public_id: { $in: imagesToDelete },
        },
      };

      await cloudinary.api.delete_resources(imagesToDelete);
    }
  }

  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId, createdBy: userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedProduct) throw new CustomError("Producto no encontrado", 404);

  return updatedProduct;
};

const deleteProduct = async(productId, userId) => {

    const productDeleted = await Product.findOneAndDelete({
      _id: productId, 
      createdBy: userId
    });

    if (!productDeleted) throw new CustomError('Producto no encontrado', 404)

    if (productDeleted.images && productDeleted.images.length > 0) {
        const publicIds = productDeleted.images.map(img => img.public_id);
        await cloudinary.api.delete_resources(publicIds);
    }

    return productDeleted
}

module.exports = {
  createProduct,
  getAdminProducts,
  getAdminProductById,
  updateProduct,
  deleteProduct
}