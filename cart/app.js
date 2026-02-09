if (process.env.PROD_TYPE !== "docker") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const {
  KafkaProducer,
  KafkaConsumer,
} = require("./components/controllers/Kafka");

const Cart = require("./models/Cart");
const CartProducts = require("./models/CartProducts");

const {
  MONGO_USER,
  MONGO_USER_PASSWORD,
  MONGO_COLLECTION,
  MONGO_PORT,
  SERVICE_PORT,
  MONGO_IP,
  API_PREFIX,
  SERVICE_CLIENT_ID,
} = process.env;

const app = express();

const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

const start = async () => {
  try {
    const serviceLog = "Cart service running on port: " + SERVICE_PORT;
    const mongoLog = "Cart database running on port: " + MONGO_PORT;

    app.listen(SERVICE_PORT, () => {
      console.log(serviceLog);
      KafkaProducer("info-message", mongoLog);
    });
    mongoose
      .connect(
        (MONGO = `mongodb://${MONGO_IP}:${MONGO_PORT}/${MONGO_COLLECTION}`),
        {
          user: MONGO_USER,
          pass: MONGO_USER_PASSWORD,
          authSource: "admin",
        },
      )
      .then(() => {
        console.log(mongoLog);
        KafkaProducer("info-message", mongoLog);
      });
  } catch (err) {
    console.error(err.message);
    KafkaProducer("error-message", {
      error: err.message,
      msg: "Cart server could not start up",
    });
  }
};
start();

const createCart = async ({ userId }) => {
  try {
    const newCart = new Cart({
      userId: new mongoose.Types.ObjectId(userId),
      products: [],
    });

    await newCart.save();

    KafkaProducer(
      "info-message",
      "Successfully created cart allocated to user - " + userId,
    );
  } catch (err) {
    console.error(err.message);
    KafkaProducer("error-message", {
      error: err.message,
      msg: "Could not create Cart allocated to user - " + userId,
    });
  }
};

KafkaConsumer(SERVICE_CLIENT_ID, "user-created", createCart);

const CartPOST = require("./routes/v1/POST/Cart");
const CartGET = require("./routes/v1/GET/Cart");
const CartDELETE = require("./routes/v1/DELETE/Cart");

app.use(API_PREFIX, CartPOST);
app.use(API_PREFIX, CartGET);
app.use(API_PREFIX, CartDELETE);
