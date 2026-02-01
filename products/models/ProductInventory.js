const { Schema, model } = require("mongoose");

const productInventorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      maxLength: 500,
    },
    productId: {
      type: Schema.Types.ObjectId,
      unique: true,
      required: true,
    },
    quantity: {
      required: true,
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

const ProductInventory = new model("ProductInventory", productInventorySchema);

module.exports = ProductInventory;
