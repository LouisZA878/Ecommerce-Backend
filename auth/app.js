if (process.env.PROD_TYPE !== "docker") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const { KafkaProducer } = require("./components/controllers/Kafka");

const {
  MONGO_USER,
  MONGO_USER_PASSWORD,
  MONGO_COLLECTION,
  MONGO_PORT,
  SERVICE_PORT,
  MONGO_IP,
  API_PREFIX,
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
    const serviceLog = "Auth service running on port: " + SERVICE_PORT;
    const mongoLog = "Auth database running on port: " + MONGO_PORT;

    app.listen(SERVICE_PORT, () => {
      console.log(serviceLog);
      KafkaProducer("info-message", mongoLog);
    });
    mongoose
      .connect(`mongodb://${MONGO_IP}:${MONGO_PORT}/${MONGO_COLLECTION}`, {
        user: MONGO_USER,
        pass: MONGO_USER_PASSWORD,
        authSource: "admin",
      })
      .then(() => {
        console.log(mongoLog);
        KafkaProducer("info-message", mongoLog);
      });
  } catch (err) {
    console.error(err.message);
    KafkaProducer("error-message", {
      error: err.message,
      msg: "Auth server could not start up",
    });
  }
};

start();

const Auth = require("./routes/v1/POST/Auth");
const Refresh = require("./routes/v1/POST/Refresh");

app.use(API_PREFIX, Auth);
app.use(API_PREFIX, Refresh);
