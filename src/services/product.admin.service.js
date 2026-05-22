const getFilters = require("../helpers/get-filters.helper");
const { uploadFiles } = require("../helpers/upload-files.helper");
const { productAdminRepository } = require("../repositories/postgres");
const CustomError = require("../utils/custom-error.util");
const getPagination = require("../utils/get-pagination.util");
const getSort = require("../utils/get-sort.util");
const cloudinary = require('../config/cloudinary.config');
const formatProduct = require("../helpers/format-product.helper");

const createProduct = async(data, files = [], userId) => {

  const {title, price, description, stock, category, sizes, gender, colors, type, brand} = data;

  let imgUrls = [];
  if (files.length > 0) {
    imgUrls = await uploadFiles(files);
  }

  const productData = {
    title,
    price: Number(price),
    description,
    stock: Number(stock),
    category,
    images: {
      create: imgUrls.map((img) => ({
        url: img.url,
        publicId: img.publicId
      }))
    },
    createdById: userId,
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

  const newProduct = await productAdminRepository.createProduct(productData);

  return formatProduct(newProduct);
};

const getAdminProducts = async(query, userId) => {

  const { order, page = 1, limit = 10 } = query;

  const filters = getFilters({ ...query, createdById: userId, isAdmin: true });
  const sort = getSort(order);
  const { pageNum, limitNum, skip } = getPagination(page, limit);

  const [products, totalProducts] = await Promise.all([
    productAdminRepository.getAdminProducts({
      filters,
      sort,
      skip,
      limit: limitNum,
    }),
    productAdminRepository.countAdminProducts(filters),
  ]);


  return {
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalProducts: totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
    },
    products: products.map(formatProduct)
  };
};

const getAdminProductById = async(productId, userId) => {

  const product = await productAdminRepository.findAdminProductById(productId, userId);

  if (!product) throw new CustomError('Producto no encontrado', 404);

  return formatProduct(product);
};

const updateProduct = async(productId, userId, body, files) => {
  const { deletedImages, ...updatedFields } = body;

  const product = await productAdminRepository.findAdminProductById(productId, userId);
  if(!product) throw new CustomError('Producto no encontrado', 404);

  const dataToUpdate = { 
    ...updatedFields,
  };

  if(updatedFields.price !== undefined) dataToUpdate.price = Number(updatedFields.price)
  if(updatedFields.stock !== undefined) dataToUpdate.stock = Number(updatedFields.stock)
  if(updatedFields.isActive !== undefined) dataToUpdate.isActive = updatedFields.isActive === 'true' 

  if(deletedImages) {
    const parsed = JSON.parse(deletedImages);

    if (Array.isArray(parsed) && parsed.length > 0) {
      await cloudinary.api.delete_resources(parsed);
      await productAdminRepository.deleteProductImages(parsed)
    }
  }

  if (files && files.length > 0) {
    const urlFiles = await uploadFiles(files);
    
    dataToUpdate.images = { 
      create: urlFiles.map((img) => ({ 
        url: img.url, 
        publicId: img.publicId, 
      })), 
    };
  }

  const updatedProduct = await productAdminRepository.updateProduct(productId, dataToUpdate);

  return formatProduct(updatedProduct)
};

const deleteProduct = async(productId, userId) => {

  const productDeleted = await productAdminRepository.deleteAdminProductById(productId, userId);

  if (!productDeleted) throw new CustomError('Producto no encontrado', 404)

  if (productDeleted.images && productDeleted.images.length > 0) {
      const publicIds = productDeleted.images.map(img => img.publicId);
      await cloudinary.api.delete_resources(publicIds);
  }

  return formatProduct(productDeleted)
}

module.exports = {
  createProduct,
  getAdminProducts,
  getAdminProductById,
  updateProduct,
  deleteProduct
}