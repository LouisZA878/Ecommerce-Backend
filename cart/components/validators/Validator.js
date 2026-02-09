const mongoose = require("mongoose");
const { ExpressValidator } = require("express-validator");

const CartProducts = require("../../models/CartProducts");

const { body, validationResult, matchedData } = new ExpressValidator({
  isIdValid: async (value) => {
    const valid = mongoose.Types.ObjectId.isValid(value);

    if (!valid) {
      console.log(valid);
      throw new Error("Invalid ID");
    }
  },
  isNumber: (value) => {
    if (Number.isNaN(parseInt(value, 10))) {
      throw new Error("Value must be a number");
    }

    return true;
  },
  isIdExist: async (value) => {
    const result = await CartProducts.findOne({
      productId: new mongoose.Types.ObjectId(value),
    });

    if (result) {
      throw new Error("Existing product already exists in the cart");
    }

    return true;
  },
});

module.exports = {
  body,
  validationResult,
  matchedData,
};
