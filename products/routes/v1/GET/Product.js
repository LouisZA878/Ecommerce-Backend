const router = require("express").Router();
const mongoose = require("mongoose");

const Product = require("../../../models/Product");
const Auth = require("../../../components/middleware/Auth");
const { FetchFile } = require("../../../components/utils/File");

const {
  queryLimit,
  queryPage,
  querySort,
  paramId,
  matchedData,
  querySearch,
} = require("../../../components/validators/Output");
const validationArray = require("../../../components/middleware/validationArray");

const { KafkaProducer } = require("../../../components/controllers/Kafka");

const collectionName = process.env.MONGO_IMAGE_COLLECTION;

router.get("/product/image/:id", Auth, async (req, res) => {
  try {
    const downloadStream = FetchFile(collectionName, req.params.id);

    downloadStream.on("file", (file) => {
      res.setHeader("Content-Type", file.metadata.mimetype);
    });

    downloadStream.on("error", (err) => {
      console.error(err.message);
      res.status(404).json({
        data: {},
        success: false,
        description: "Could not fetch your image",
      });
    });

    KafkaProducer("info-message", "Successfully fetched image");

    downloadStream.pipe(res);
  } catch (err) {
    console.error(err.message);
    KafkaProducer("error-message", {
      error: err.message,
      msg: "Could not fetch the image",
    });
    res.status(400).json({
      data: {},
      success: false,
      description: "Could not fetch the image",
    });
  }
});

router.get(
  "/product/mine",
  Auth,
  [
    queryLimit().isLimitValid(),
    queryPage(),
    querySort().isSortValid(),
    querySearch(),
  ],
  validationArray("Must provide valid inputs"),
  async (req, res) => {
    try {
      const { page, limit, sort, q } = matchedData(req);

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const result = await Product.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.userId),
            name: {
              $regex: !!q ? q : "",
              $options: "i",
            },
          },
        },
        {
          $sort: { createdAt: sort === "ascend" ? 1 : -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: parseInt(limit),
        },
        {
          $lookup: {
            from: "productinventories",
            localField: "_id",
            foreignField: "productId",
            as: "inventory",
          },
        },
        {
          $unwind: {
            path: "$inventory",
          },
        },
        {
          $unset: [
            "inventory._id",
            "inventory.userId",
            "inventory.productId",
            "inventory.__v",
            "inventory.createdAt",
            "inventory.updatedAt",
            "__v",
            "userId",
            "updatedAt",
          ],
        },
      ]);

      KafkaProducer(
        "info-message",
        "Successfully fetched a list of products from this user",
      );
      res.status(200).send({
        data: result,
        success: true,
        description: "Successuly fetched a list of products",
      });
    } catch (err) {
      console.error(err.message);
      KafkaProducer("error-message", {
        error: err.message,
        msg: "Could not fetch the list of products",
      });
      res.status(400).send({
        data: {},
        success: false,
        description: "Could not fetch the list of products",
      });
    }
  },
);
router.get(
  "/product/",
  Auth,
  [
    queryLimit().isLimitValid(),
    queryPage(),
    querySort().isSortValid(),
    querySearch(),
  ],
  validationArray("Must provide valid inputs"),
  async (req, res) => {
    try {
      const { page, limit, sort, q } = matchedData(req);

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const result = await Product.aggregate([
        {
          $match: {
            name: {
              $regex: !!q ? q : "",
              $options: "i",
            },
          },
        },
        {
          $sort: { createdAt: sort === "ascend" ? 1 : -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: parseInt(limit),
        },
        {
          $lookup: {
            from: "productinventories",
            localField: "_id",
            foreignField: "productId",
            as: "inventory",
          },
        },
        {
          $unwind: {
            path: "$inventory",
          },
        },
        {
          $unset: [
            "inventory._id",
            "inventory.userId",
            "inventory.productId",
            "inventory.__v",
            "inventory.createdAt",
            "inventory.updatedAt",
            "__v",
            "userId",
            "updatedAt",
          ],
        },
      ]);

      KafkaProducer("info-message", "Successfully fetched a list of products");

      res.status(200).send({
        data: result,
        success: true,
        description: "Successuly fetched a list of products",
      });
    } catch (err) {
      console.error(err.message);
      KafkaProducer("error-message", {
        error: err.message,
        msg: "Could not fetch the list of products",
      });
      res.status(400).send({
        data: {},
        success: false,
        description: "Could not fetch the list of products",
      });
    }
  },
);

router.get(
  "/product/singular/:id",
  Auth,
  [paramId().isIdValid()],
  validationArray("Must provide valid inputs"),
  async (req, res) => {
    try {
      const { id } = matchedData(req);

      const result = await Product.findById(
        new mongoose.Types.ObjectId(id),
      ).select(["-userId", "-createdAt", "-updatedAt", "-__v"]);

      res.status(200).send({
        data: result,
        success: true,
        description: "Successfully fetched product information",
      });
    } catch (err) {
      console.error(err.message);
      KafkaProducer("error-message", {
        error: err.message,
        msg: "Could not fetch product information",
      });
      res.status(400).send({
        data: {},
        success: false,
        description: "Could not fetch the products information",
      });
    }
  },
);

module.exports = router;
