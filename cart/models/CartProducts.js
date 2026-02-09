const { Schema, model } = require("mongoose");

const cartProductsSchema = new Schema({
  cartId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  quantity: {
    required: true,
    type: Number,
    min: 1,
  },
});

const CartProducts = new model("CartProducts", cartProductsSchema);

module.exports = CartProducts;
