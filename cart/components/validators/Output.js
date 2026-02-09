const { body, validationResult, matchedData } = require("./Validator");

const quantity = () =>
  body("quantity").notEmpty().withMessage("Must be a valid integer").escape();
const Id = () => body("id").notEmpty().withMessage("ID must be valid").escape();

module.exports = {
  validationResult,
  matchedData,
  quantity,
  Id,
};
