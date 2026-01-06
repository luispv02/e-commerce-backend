const { uploadFiles } = require("../helpers/upload-files.helper");
const Product = require("../models/Product.model");

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

module.exports = {
  createProduct
}