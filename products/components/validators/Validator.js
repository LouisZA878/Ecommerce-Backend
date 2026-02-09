const mongoose = require("mongoose");
const { ExpressValidator } = require("express-validator");

const { body, param, query, validationResult, matchedData } =
  new ExpressValidator({
    isIdValid: async (value) => {
      const valid = mongoose.Types.ObjectId.isValid(value);
      if (!valid) {
        throw new Error("Invalid ID");
      }

      return true;
    },
    isNumber: (value) => {
      if (Number.isNaN(parseInt(value, 10))) {
        throw new Error("Value must be a number");
      }

      return true;
    },
    isSortValid: (value) => {
      const options = ["ascend", "descend"];

      if (!options.includes(value.toLowerCase())) {
        throw new Error("Sort value must be either ascend or descend");
      }

      return true;
    },
    isLimitValid: (value) => {
      const options = [1, 5, 10, 25, 50];

      if (!options.includes(parseInt(value))) {
        throw new Error("Value must be a choice between 1, 5, 10, 25 and 50");
      }

      return true;
    },
  });

module.exports = {
  body,
  param,
  validationResult,
  matchedData,
  query,
};
