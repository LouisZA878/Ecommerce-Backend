const { validationResult } = require("../validators/Output");
const ValidationArray = (description) => (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result.array());

    return res.status(400).send({
      data: {},
      success: false,
      description,
    });
  }

  next();
};

module.exports = ValidationArray;
