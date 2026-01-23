const router = require("express").Router();
const bcrypt = require("bcrypt");

const User = require("../../../models/User");

const {
  createAccessToken,
  createRefreshToken,
} = require("../../../components/utils/Token");

const {
  Email,
  Password,
  Username,
  matchedData,
} = require("../../../components/validators/Output");
const ValidationArray = require("../../../components/middleware/ValidationArray");

router.post(
  "/signup",
  [Email().isEmailExisting(), Password(), Username().isUserExisting()],
  ValidationArray("Unsuccessfully creater user"),
  async (req, res) => {
    try {
      const { username, password, email } = matchedData(req);
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        username,
        password: hashedPassword,
        email,
      });
      newUser.save().then(() => console.log("Sucessfully created user"));

      res.status(201).send({
        error: [],
        data: {},
        success: true,
        description: "Successfully created user",
      });
    } catch (err) {
      console.error(err.message);
      res.status(400).send({
        data: {},
        success: false,
        description: "Unsuccessfully created user",
      });
    }
  },
);

router.post(
  "/signin",
  [Email(), Password(), Username()],
  ValidationArray("Unsuccessfully sign in"),
  async (req, res) => {
    try {
      const { password, email } = matchedData(req);
      const response = await User.findOne({ email });
      if (response) {
        const storedPassword = response.password;
        bcrypt.compare(password, storedPassword, (err, result) => {
          if (result) {
            const accessToken = createAccessToken(response._id);

            const refreshToken = createRefreshToken(response._id);

            res.cookie("refreshToken", refreshToken, {
              httpOnly: true,
              secure: false,
              sameSite: "",
              expires: new Date(Date.now() + 60 * 60 * 60 * 24 * 1 * 1000),
            });
            res.cookie("accessToken", accessToken, {
              secure: false,
              httpOnly: true,
              sameSite: "",
              expires: new Date(Date.now() + 15 * 60 * 1000),
            });

            res.json({
              data: {},
              success: true,
              description: "Successfully signed in",
            });
          }

          if (err) {
            console.log(err);
            res.status(400).send({
              data: {},
              success: false,
              description: "Unsuccessfully signed in",
            });
          }
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(400).send({
        data: {},
        success: false,
        description: "Unsuccessfully signed in",
      });
    }
  },
);

module.exports = router;
