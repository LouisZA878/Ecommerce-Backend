const { body, validationResult, matchedData } = require("./Validator");

const Username = () =>
  body("username")
    .notEmpty()
    .isLength({ min: 6, max: 30 })
    .withMessage("Username must be valid")
    .escape();
const Password = () =>
  body("password")
    .notEmpty()
    .isLength({ min: 6, max: 64 })
    .withMessage("Password must be valid")
    .escape();
const Email = () =>
  body("email")
    .notEmpty()
    .isEmail()
    .isLength({ min: 6, max: 254 })
    .withMessage("Must be a valid email")
    .escape();
const Id = () => body("id").notEmpty().withMessage("ID must be valid").escape();

module.exports = {
  validationResult,
  matchedData,
  Username,
  Password,
  Email,
  Id,
};
