const { Schema, model } = require("mongoose");

const productchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      maxLength: 500,
    },
    name: {
      type: String,
      required: true,
      maxLength: 256,
      minLength: 3,
    },
    description: {
      type: String,
      minLength: 0,
      maxLength: 1024,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    categories: {
      type: [String],
      required: true,
      minLength: 1,
      maxLength: 1,
    },
    imageIDs: {
      type: [Schema.Types.ObjectId],
      maxLength: 5,
      minLength: 0,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Product = new model("Product", productchema);

module.exports = Product;
