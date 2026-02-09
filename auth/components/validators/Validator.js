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

    return true;
  },
  isEmailExisting: async (value) => {
    const result = await User.findOne({ email: value });
    console.log(result);
    if (result) {
      throw new Error("Invalid email");
    }

    return true;
  },

  isUserExisting: async (value) => {
    const result = await User.findOne({ username: value });
    console.log(result);

    if (result) {
      throw new Error("Invalid username");
    }

    return true;
  },
});

module.exports = {
  body,
  validationResult,
  matchedData,
};
