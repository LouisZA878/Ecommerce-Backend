const router = require("express").Router();
const mongoose = require("mongoose");

const Auth = require("../../../components/middleware/Auth");
const validationArray = require("../../../components/middleware/validationArray");
const { body, matchedData } = require("../../../components/validators/Output");
const Product = require("../../../models/Product");
const ProductInventory = require("../../../models/ProductInventory");
const { deleteImage } = require("../../../components/utils/File");

const collectionName = process.env.MONGO_IMAGE_COLLECTION;

router.delete(
  "/product/delete",
  Auth,
  [body("productId").notEmpty().isIdValid().escape()],
  validationArray("Must provide valid inputs"),
  async (req, res) => {
    try {
      const { productId } = matchedData(req);

      const productDel = await Product.findOneAndDelete({
        userId: new mongoose.Types.ObjectId(req.userId),
        _id: new mongoose.Types.ObjectId(productId),
      });

      if (!productDel) {
        return res.status(400).send({
          data: {},
          success: false,
          description: "Could not delete product",
        });
      }

      await ProductInventory.findOneAndDelete({
        userId: new mongoose.Types.ObjectId(req.userId),
        productId: new mongoose.Types.ObjectId(productId),
      });

      productDel.imageIDs.forEach((x) => {
        deleteImage(collectionName, new mongoose.Types.ObjectId(x));
      });

      res.status(200).send({
        data: {},
        success: true,
        description: "Successfully deleted product",
      });
    } catch (err) {
      console.error(err.message);
      res.status(400).send({
        data: {},
        success: false,
        description: "Could not delete product",
      });
    }
  },
);
router.delete(
  "/product/image/delete",
  Auth,
  [body("imageId").notEmpty().isIdValid().escape()],
  validationArray("Must provide valid inputs"),
  async (req, res) => {
    try {
      const { imageId } = matchedData(req);

      const result = await Product.aggregate([
        { $match: { imageIDs: new mongoose.Types.ObjectId(imageId) } },
        {
          $project: {
            _id: 1,
            imageIDs: 1,
          },
        },
      ]);

      if (!result.length) {
        return res.status(400).send({
          data: {},
          success: false,
          description: "Could not delete product image",
        });
      }

      await Product.findOneAndUpdate(
        { _id: result[0]._id },
        {
          imageIDs: result[0].imageIDs.filter((x) => x != imageId),
        },
      );

      deleteImage(collectionName, new mongoose.Types.ObjectId(imageId));

      res.status(200).send({
        data: {},
        success: true,
        description: "Successfully deleted product image",
      });
    } catch (err) {
      console.error(err.message);
      res.status(400).send({
        data: {},
        success: false,
        description: "Could not delete product image",
      });
    }
  },
);

module.exports = router;
