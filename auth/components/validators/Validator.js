const mongoose = require("mongoose");
const { ExpressValidator } = require("express-validator");

const User = require("../../models/User");

const { body, validationResult, matchedData } = new ExpressValidator({
  isIdValid: async (value) => {
    const valid = mongoose.Types.ObjectId.isValid(value);
    console.log(valid);
    console.log(value);
    if (!valid) {
      console.log(valid);
      throw new Error("Invalid ID");
    }
  },
  isEmailExisting: async (value) => {
    const result = await User.findOne({ email: value });
    if (result) {
      throw new Error("Invalid email");
    }
  },

  isUserExisting: async (value) => {
    const result = await User.findOne({ username: value });
    if (result) {
      throw new Error("Invalid username");
    }
  },
});

module.exports = {
  body,
  validationResult,
  matchedData,
};
