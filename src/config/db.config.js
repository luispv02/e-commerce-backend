const mongoose = require('mongoose')

const dbConnection = async() => {

  try {
    await mongoose.connect(process.env.DATABASE_URL);
  } catch (error) {
    throw new Error('Error al iniciar DB')
  }
}

module.exports = { dbConnection };