const jwt = require("jsonwebtoken");

const { ACCESS_TOKEN_SIGNATURE } = process.env;

const Auth = async (req, res, next) => {
  const accessToken = req.cookies["accessToken"];

  if (!accessToken) {
    return res.status(401).send({
      error: [],
      data: {},
      success: false,
      description: "Unauthorized access",
    });
  }

  try {
    const decodeAccessToken = jwt.verify(accessToken, ACCESS_TOKEN_SIGNATURE);
    req.userId = decodeAccessToken.id;

    return next();
  } catch (err) {
    console.error(err.message);
    res.status(401).send({
      data: {},
      success: false,
      description: "Unauthorized access",
    });
  }
};

module.exports = Auth;
