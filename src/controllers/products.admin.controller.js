
const getFilters = require("../helpers/get-filters.helper");
const { uploadFiles } = require("../helpers/upload-files.helper");
const Product = require("../models/Product.model");
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
      msg: 'Producto creado'
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

module.exports = {
  createProduct,
  getAdminProducts
}