const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { createAccessToken } = require("../../../components/utils/Token");

const { REFRESH_TOKEN_SIGNATURE } = process.env;

router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies["refreshToken"];

  if (!refreshToken) {
    return res.status(401).send({
      data: {},
      success: false,
      description: "Unauthorized access",
    });
  }

  try {
    const decodeRefreshToken = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SIGNATURE,
    );

    const { id } = decodeRefreshToken;
    const accessToken = createAccessToken({ id });

    res.cookie("accessToken", accessToken, {
      secure: false,
      httpOnly: true,
      sameSite: "",
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });
    res.status(200).send({
      data: {},
      success: true,
      description: "Tokens refreshed",
    });
  } catch (err) {
    res.status(401).send({
      data: {},
      success: false,
      description: "Unauthorized access",
    });
  }
});

module.exports = router;
