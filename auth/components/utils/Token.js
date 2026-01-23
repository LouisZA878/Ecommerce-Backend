const jwt = require("jsonwebtoken");
const createAccessToken = (id) => {
  const token = jwt.sign({ id }, process.env.ACCESS_TOKEN_SIGNATURE, {
    expiresIn: "15m",
    algorithm: "HS256",
    issuer: "TechyTechy",
  });

  return token;
};
const createRefreshToken = (id) => {
  const token = jwt.sign({ id }, process.env.REFRESH_TOKEN_SIGNATURE, {
    expiresIn: "1d",
    algorithm: "HS256",
    issuer: "TechyTechy",
  });
  return token;
};

module.exports = { createAccessToken, createRefreshToken };
