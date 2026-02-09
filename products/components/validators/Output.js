const {
  body,
  param,
  query,
  validationResult,
  matchedData,
} = require("./Validator");

const name = () =>
  body("name")
    .notEmpty()
    .isLength({ min: 3, max: 254 })
    .withMessage("Name must be valid")
    .escape();
const description = () =>
  body("description")
    .optional()
    .isLength({ min: 0, max: 1024 })
    .withMessage("Description must be valid")
    .escape();

const categories = () =>
  body("categories").notEmpty().withMessage("Categories must be vaid").escape();
const price = () =>
  body("price").notEmpty().withMessage("Price must be valid").escape();
const quantity = () =>
  body("quantity").notEmpty().withMessage("Quantity must be vaid").escape();

const Id = () => body("id").notEmpty().withMessage("ID must be valid").escape();

const paramId = () =>
  param("id").notEmpty().withMessage("ID must be valid").escape();

const queryLimit = () => query("limit").notEmpty().escape();
const querySort = () => query("sort").notEmpty().escape();
const queryPage = () => query("page").notEmpty().escape();
const querySearch = () => query("q").optional().escape();

module.exports = {
  body,
  validationResult,
  matchedData,
  paramId,
  categories,
  price,
  description,
  Id,
  name,
  paramId,
  quantity,
  queryLimit,
  querySort,
  queryPage,
  querySearch,
};
