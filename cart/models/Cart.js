const { Schema, model } = require("mongoose");

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    maxLength: 500,
    unique: true,
  },
  products: {
    type: [],
    maxLength: 100,
    minLength: 0,
    required: true,
    default: [],
  },
});

const Cart = new model("Cart", cartSchema);

module.exports = Cart;
