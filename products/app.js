if (process.env.PROD_TYPE !== "docker") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

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

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

const start = async () => {
  try {
    const serviceLog = "Product service running on port: " + SERVICE_PORT;
    const mongoLog = "Product database running on port: " + MONGO_PORT;

    app.listen(SERVICE_PORT, () => {
      console.log(serviceLog);
      KafkaProducer("info-message", serviceLog);
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
      msg: "Products server could not start up",
    });
  }
};

start();

const ProductPOST = require("./routes/v1/POST/Product");

const ProductGET = require("./routes/v1/GET/Product");

const ProductPATCH = require("./routes/v1/PATCH/Product");
const ProductDELETE = require("./routes/v1/DELETE/Product");

app.use(API_PREFIX, ProductPOST);
app.use(API_PREFIX, ProductGET);
app.use(API_PREFIX, ProductPATCH);
app.use(API_PREFIX, ProductDELETE);
