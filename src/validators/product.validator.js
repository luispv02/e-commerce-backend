const { body } = require("express-validator");

const isOptional = (validation, isOptional) => {
  return isOptional ? validation.optional({ nullable: true }) : validation;
};

const baseProductValidations = (optional = false) => [
  isOptional(
    body('title')
      .trim()
      .notEmpty()
      .withMessage('El título es obligatorio'),
    optional
  ),

  isOptional(
    body('price')
      .isInt({ min: 1 })
      .withMessage('Precio inválido'),
    optional
  ),

  isOptional(
    body('description')
      .trim()
      .notEmpty()
      .withMessage('La descripción es obligatoria'),
    optional
  ),

  isOptional(
    body('stock')
      .isInt({ min: 0 })
      .withMessage('Stock inválido'),
    optional
  ),

  isOptional(
    body('category')
      .isIn(['clothes', 'technology', 'others'])
      .withMessage('Categoría inválida'),
    optional
  ),

  isOptional(
    body('type')
      .if(body('category').not().equals('others'))
      .notEmpty()
      .withMessage('El tipo de producto es obligatorio'),
    optional
  ),

  isOptional(
    body('files')
      .custom((value, {req}) => {
        if(!req.files || req.files.length === 0){
          throw new Error('File no valido');
        }
        return true;
      }),
    optional
  ),
];

const clothesValidations = (optional = false) => [
  isOptional(
    body('sizes')
      .if(body('category').equals('clothes'))
      .isArray({ min: 1 })
      .withMessage('La talla es obligatoria'),
    optional
  ),

  isOptional(
    body('sizes.*')
      .if(body('category').equals('clothes'))
      .isIn(['xs', 's', 'm', 'l', 'xl', 'xxl'])
      .withMessage('Talla inválida'),
    optional
  ),

  isOptional(
    body('gender')
      .if(body('category').equals('clothes'))
      .isIn(['men', 'women', 'kid'])
      .withMessage('Género inválido'),
    optional
  ),

  isOptional(
    body('colors')
      .if(body('category').equals('clothes'))
      .isArray({ min: 1 })
      .withMessage('El color es obligatorio'),
    optional
  ),

  isOptional(
    body('colors.*')
      .if(body('category').equals('clothes'))
      .isString()
      .notEmpty()
      .withMessage('Color inválido'),
    optional
  ),
];

const technologyValidations = (optional = false) => [
  isOptional(
    body('brand')
      .if(body('category').equals('technology'))
      .notEmpty()
      .withMessage('La marca es obligatoria'),
    optional
  ),
];

const createProductValidations = [
  ...baseProductValidations(),
  ...clothesValidations(),
  ...technologyValidations()
];

const updateProductValidations = [
  ...baseProductValidations(true),
  ...clothesValidations(true),
  ...technologyValidations(true)
];



module.exports = {
  createProductValidations,
  updateProductValidations
};