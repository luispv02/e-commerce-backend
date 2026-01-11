
const getFilters = require("../helpers/get-filters.helper");
const { uploadFiles } = require("../helpers/upload-files.helper");
const Product = require("../models/Product.model");
const cloudinary = require('../config/cloudinary.config');
const getPagination = require("../utils/get-pagination.util");
const getSort = require("../utils/get-sort.util");


const createProduct = async(req, res) => {
  try {
    const { title, price, description, stock, category, sizes, gender, colors, type, brand } = req.body;
    const files = req.files || [];
    
    let imgUrls = [];
    if(files.length > 0){
      imgUrls = await uploadFiles(files);
    }

    const productData = {
      title,
      price,
      description,
      stock,
      category,
      images: imgUrls,
      createdBy: req.user.uid,
    }

     if(category === 'clothes'){
      productData.sizes = sizes;
      productData.gender = gender;
      productData.colors = colors;
      productData.type = type;
    }

    if(category === 'technology') {
      productData.brand = brand;
      productData.type = type;
    }

    const newProduct = new Product(productData);
    await newProduct.save();

    return res.status(201).json({
      ok: true,
      msg: 'Producto creado',
      product: newProduct
    })

  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: 'Error al crear el producto'
    })
  }
}

const getAdminProducts = async(req, res) => {
  try {
    const { order, page = 1, limit = 10 } = req.query;

    const filters = getFilters({ ...req.query, createdBy: req.user.uid, isAdmin: true })
    const sort = getSort(order);
    const { pageNum, limitNum, skip } = getPagination(page, limit);

    const [products, totalProducts] = await Promise.all([
      Product
        .find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filters)
    ])

    return res.status(200).json({
      ok: true,
      data: {
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalProducts: totalProducts,
          totalPages: Math.ceil(totalProducts / limitNum)
        },
        products
      }
     
    })
  } catch (error) {
    return res.status(500).json({
      ok:false,
      msg: 'Error al obtener productos del administrador'
    })
  }
}

const getAdminProductById = async(req, res) => {
  try{

    const productId = req.params.id;
    const userId = req.user.uid;
    
    const product = await Product.findOne({
      _id: productId,
      createdBy: userId
    });

    if(!product){
      return res.status(404).json({
        ok: false,
        msg: 'Producto no encontrado'
      })
    }

    return res.status(200).json({
      ok: true,
      product
    })

  }catch(error){
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener producto'
    })
  }
}

const updateProduct = async(req, res) => {
  try{
    const productId = req.params.id;
    const userId = req.user.uid;
    const { deletedImages, ...body } = req.body;
    const files = req.files || [];

    let updateData = {
      $set: { ...body }
    };

    // Add new images
    if(files.length > 0){
      const urlFiles = await uploadFiles(files);
       updateData.$push = {
        images: { $each: urlFiles }
      };
    }

    // delete saved images
    if(deletedImages){
      const imagesToDelete = JSON.parse(deletedImages);

      if(Array.isArray(imagesToDelete) && imagesToDelete.length > 0){
         updateData.$pull = {
          images: {
            public_id: { $in: imagesToDelete }
          }
        };

        await cloudinary.api.delete_resources(imagesToDelete);
      }
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, createdBy: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        ok: false,
        msg: 'Producto no encontrado'
      });
    }
    
    return res.status(200).json({
      ok: true,
      msg: 'Producto actualizado',
      product: updatedProduct
    })
  }catch(error){
    return res.status(500).json({
      ok: false,
      msg: 'Error al actualizar producto'
    })
  }
}

const deleteProduct = async(req, res) => {
  try{
    const productId = req.params.id;
    const userId = req.user.uid;

    const productDeleted = await Product.findOneAndDelete({
      _id: productId, 
      createdBy: userId
    });

    if (!productDeleted) {
      return res.status(404).json({
        ok: false,
        msg: 'Producto no encontrado'
      });
    }

    if (productDeleted.images && productDeleted.images.length > 0) {
      const publicIds = productDeleted.images.map(img => img.public_id);
      await cloudinary.api.delete_resources(publicIds);
    }

    return res.status(200).json({
      ok: true,
      msg: 'Producto eliminado',
      product: productDeleted
    });

  }catch(error){
    return res.status(500).json({
      ok: false,
      msg: 'Error al eliminar producto'
    })
  }
}

module.exports = {
  createProduct,
  getAdminProducts,
  getAdminProductById,
  updateProduct,
  deleteProduct
}