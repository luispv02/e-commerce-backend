const cloudinary = require('../config/cloudinary.config');

const uploadFiles = async (files) => {

  try {
    if(!files || files.length === 0) return [];

    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'ecommerce/products',
            resource_type: 'image',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' }
            ]
          },
          (error, uploadResult) => {
            if (error) return reject(error);
            resolve(uploadResult);
          }
        );
        uploadStream.end(file.buffer);
      })
    })

    const urls = await Promise.all(uploadPromises);
    return urls.map(url => {
      return {
        url: url.secure_url,
        public_id: url.public_id
      }
    })
  } catch (error) {
    throw new Error('Error al subir imágenes a Cloudinary');
  }
}

module.exports = { uploadFiles }


