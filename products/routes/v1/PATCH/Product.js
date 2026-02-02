const router = require("express").Router();
const mongoose = require("mongoose");

const Product = require("../../../models/Product");
const ProductInventory = require("../../../models/ProductInventory");
const Auth = require("../../../components/middleware/Auth");
const {
  uploadArray,
  uploadToGridFS,
} = require("../../../components/utils/File");
const validationArray = require("../../../components/middleware/validationArray");
const { body, matchedData } = require("../../../components/validators/Output");

const { KafkaProducer } = require("../../../components/controllers/Kafka");

const collectionName = process.env.MONGO_IMAGE_COLLECTION;

router.patch(
  "/product/update",
  Auth,
  [
    body("productId").notEmpty().isIdValid().escape(),
    body("name").optional().escape(),
    body("quantity").optional().escape(),
    body("description").optional().escape(),
    body("price").optional().escape(),
    body("categories").optional().escape(),
  ],
  validationArray("Must use valid inputs"),
  async (req, res) => {
    try {
      const maxCategory = 10;
      const minCategory = 1;
      const bodyData = matchedData(req);

      const optionals = {};

      if (!!bodyData.quantity) {
        await ProductInventory.findOneAndUpdate(
          {
            productId: new mongoose.Types.ObjectId(bodyData.productId),
            userId: new mongoose.Types.ObjectId(req.userId),
          },
          {
            quantity: bodyData.quantity,
          },
        );
      }

      if (!!bodyData.categories) {
        if (
          bodyData.categories.length > minCategory ||
          bodyData.categories.length < maxCategory
        ) {
          optionals.categories = bodyData.categories;
        }
      }
      if (!!bodyData.price) {
        optionals.price = parseInt(bodyData.price);
      }
      if (!!bodyData.description) {
        optionals.description = bodyData.description;
      }

      await Product.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(bodyData.productId),
          userId: new mongoose.Types.ObjectId(req.userId),
        },
        optionals,
      );

      KafkaProducer("info-message", "Successfully updated product information");

      res.status(200).send({
        data: {},
        success: true,
        description: "Successfully updated product information",
      });
    } catch (err) {
      console.error(err.message);
      KafkaProducer("error-message", {
        error: err.message,
        msg: "Could not update the product information",
      });
      res.status(400).send({
        data: {},
        success: false,
        description: "Could not update the product information",
      });
    }
  },
);

router.patch(
  "/product/image/update",
  Auth,
  uploadArray("files"),
  [body("productId").notEmpty().isIdValid().escape()],
  validationArray("Must use valid inputs"),
  async (req, res) => {
    try {
      const { productId } = matchedData(req);
      const result = await Product.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(productId),
            userId: new mongoose.Types.ObjectId(req.userId),
          },
        },
        {
          $project: {
            _id: 0,
            itemCount: {
              $size: "$imageIDs",
            },
          },
        },
      ]);

      const totalFreeSpace = 5 - result[0].itemCount;
      if (totalFreeSpace === 0) {
        return res.status(400).send({
          data: {},
          success: false,
          description: "The product image gallery is full",
        });
      }

      const imagesUsed = req.files.slice(0, totalFreeSpace);

      const results = await Promise.all(
        imagesUsed.map(async (file) => {
          const image_mimes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
          ];
          if (!image_mimes.includes(file.mimetype)) {
            return;
          }
          const result = await uploadToGridFS(collectionName, file);
          return new mongoose.Types.ObjectId(result.gridFSFile._id);
        }),
      );

      const ImageIDs = results.filter((x) => !!x === true);

      if (ImageIDs.length > 0) {
        await Product.findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(productId),
          },
          {
            $push: {
              imageIDs: {
                $each: ImageIDs,
              },
            },
          },
        );
      }

      res.status(200).send({
        data: {},
        success: true,
        description: "Successfully updated product image gallery",
      });
    } catch (err) {
      console.error(err.message);
      res.status(400).send({
        data: {},
        success: false,
        description: "Could not update product images",
      });
    }
  },
);

module.exports = router;
