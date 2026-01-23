const jwt = require("jsonwebtoken");

const { createAccessToken } = require("../utils/Tokens");

const { ACCESS_TOKEN_SIGNATURE, REFRESH_TOKEN_SIGNATURE } = process.env;

const Auth = async (req, res, next) => {
  const accessToken = req.cookies["accessToken"];
  const refreshToken = req.cookies["refreshToken"];

  if (!accessToken && !refreshToken) {
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
    req.userRole = decodeAccessToken.role;

    return next();
  } catch (err) {
    console.error(err.message);
    try {
      const decodeRefreshToken = jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SIGNATURE,
      );

      const { id, role } = decodeRefreshToken;
      const accessToken = createAccessToken(id, role);

      res.cookie("accessToken", accessToken, {
        secure: false,
        httpOnly: true,
        sameSite: "",
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      req.userId = id;
      req.userRole = role;

      return next();
    } catch (err) {
      res.status(401).send({
        error: [],
        data: {},
        success: false,
        description: "Unauthorized access",
      });
    }
  }
};

module.exports = Auth;
