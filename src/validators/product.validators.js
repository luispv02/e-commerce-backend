const { body } = require("express-validator");

const baseProductValidations = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título es obligatorio'),

  body('price')
    .isInt({ min: 1 })
    .withMessage('Precio inválido'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es obligatoria'),

  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock inválido'),

  body('category')
    .isIn(['clothes', 'technology', 'others'])
    .withMessage('Categoría inválida'),
  
  body('type')
    .if(body('category').not().equals('others'))
    .notEmpty()
    .withMessage('El tipo de producto es obligatorio'),

  body('files')
    .custom((value, {req}) => {
      if(!req.files || req.files.length === 0){
        throw new Error('File no valido');
      }
      return true;
    })
];

const clothesValidations = [
  body('sizes')
    .if(body('category').equals('clothes'))
    .isArray({ min: 1 })
    .withMessage('La talla es obligatoria'),

  body('sizes.*')
    .if(body('category').equals('clothes'))
    .isIn(['xs', 's', 'm', 'l', 'xl', 'xxl'])
    .withMessage('Talla inválida'),

  body('gender')
    .if(body('category').equals('clothes'))
    .isIn(['men', 'women', 'kid'])
    .withMessage('Género inválido'),
    
  body('colors')
    .if(body('category').equals('clothes'))
    .isArray({ min: 1 })
    .withMessage('El color es obligatorio'),

  body('colors.*')
    .if(body('category').equals('clothes'))
    .isString()
    .notEmpty()
    .withMessage('Color inválido'),
];

const technologyValidations = [
  body('brand')
    .if(body('category').equals('technology'))
    .notEmpty()
    .withMessage('La marca es obligatoria'),
];

const createProductValidations = [
  ...baseProductValidations,
  ...clothesValidations,
  ...technologyValidations
]

module.exports = createProductValidations;