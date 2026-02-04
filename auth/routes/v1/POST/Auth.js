const router = require("express").Router();
const bcrypt = require("bcrypt");

const User = require("../../../models/User");

const { KafkaProducer } = require("../../../components/controllers/Kafka");

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
  ValidationArray("Unsuccessful sign up attempt"),
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
      newUser.save().then((data) => {
        KafkaProducer("user-created", {
          userId: data._id,
        });
      });

      KafkaProducer("info-message", "Successfully created user");

      res.status(201).send({
        data: {},
        success: true,
        description: "Successfully created user",
      });
    } catch (err) {
      console.error(err.message);
      KafkaProducer("error-message", {
        error: err.message,
        msg: "Unsuccessful sign up attempt",
      });
      res.status(400).send({
        data: {},
        success: false,
        description: "Unsuccessful sign up attempt",
      });
    }
  },
);

router.post(
  "/signin",
  [Email(), Password()],
  ValidationArray("Unsuccessful sign in attempt"),
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
              sameSite: "lax",
              expires: new Date(Date.now() + 60 * 60 * 60 * 24 * 1 * 1000),
            });
            res.cookie("accessToken", accessToken, {
              secure: false,
              httpOnly: true,
              sameSite: "lax",
              expires: new Date(Date.now() + 15 * 60 * 1000),
            });

            KafkaProducer("info-message", "User successfully signed in");

            return res.status(200).send({
              data: {},
              success: true,
              description: "Successfully signed in",
            });
          }

          if (err) {
            console.log(err.message);
            KafkaProducer("error-message", {
              error: err.message,
              msg: "Unsuccessful sign in attempt",
            });
            res.status(400).send({
              data: {},
              success: false,
              description: "Unsuccessful sign in attempt",
            });
          }
        });
      }
      if (!response) {
        KafkaProducer("error-message", {
          error: "Could not find user with the requested email",
          msg: "Unsuccessful sign in attempt",
        });
        return res.status(400).send({
          data: {},
          success: false,
          description: "Unsuccessful sign in attempt",
        });
      }
    } catch (err) {
      console.error(err.message);
      KafkaProducer("error-message", {
        error: err.message,
        msg: "Unsuccessful sign in attempt",
      });
      return res.status(400).send({
        data: {},
        success: false,
        description: "Unsuccessful sign in attempt",
      });
    }
  },
);

module.exports = router;
