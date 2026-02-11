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

  const product = await Product.findOne({_id: productId,  createdBy: userId });
  if(!product) throw new CustomError('Producto no encontrado', 404);

  Object.assign(product, updatedFields);

  if(deletedImages) {
    const parsed = JSON.parse(deletedImages);

    if (Array.isArray(parsed) && parsed.length > 0) {
      await cloudinary.api.delete_resources(parsed);
      product.images = product.images.filter(img => !parsed.includes(img.public_id));
    }
  }

  if (files && files.length > 0) {
    const urlFiles = await uploadFiles(files);
    product.images.push(...urlFiles);
  }
 
  await product.save();
  return product;
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