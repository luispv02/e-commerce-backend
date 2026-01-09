const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ["clothes", "technology", "others"],
      required: true,
    },
    images: {
      type: [{
        url: String,
        public_id: String,
      }],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true
    },


    // Clothes
    sizes: {
      type: [String],
      enum: ["xs", "s", "m", "l", "xl", "xxl"],
      default: undefined
    },
    gender: {
      type: String,
      enum: ["men", "women", "kid"],
    },
    colors: {
      type: [String],
      default: undefined
    },

    // Tech
    brand: {
      type: String,
    },

    type: {
      type: String,
      required: function () {
        return this.category !== 'others';
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  },
  {
    timestamps: true
  }
);

productSchema.method('toJSON', function(){
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object
})

productSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
  type: 'text'
});

module.exports = mongoose.model('Product', productSchema)
