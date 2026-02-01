const express = require("express");
const mongoose = require("mongoose");

const Product = require("../../../models/Product");
const ProductInventory = require("../../../models/ProductInventory");

const {
  categories,
  price,
  description,
  name,
  quantity,
  matchedData,
} = require("../../../components/validators/Output");
const validationArray = require("../../../components/middleware/validationArray");

const Auth = require("../../../components/middleware/Auth");

const {
  uploadArray,
  uploadToGridFS,
} = require("../../../components/utils/File");

const router = express.Router();

const collectionName = process.env.MONGO_IMAGE_COLLECTION;

router.post(
  "/product/add",
  Auth,
  uploadArray("files"),
  [
    name(),
    categories(),
    description(),
    quantity().isNumber(),
    price().isNumber(),
  ],
  validationArray("Must provide valid inputs"),
  async (req, res) => {
    const maxCategory = 10;
    const minCategory = 1;

    const matched = matchedData(req);
    const userId = new mongoose.Types.ObjectId(req.userId);

    if (
      matched.categories.length < minCategory ||
      matched.categories.length > maxCategory
    ) {
      return res.status(400).send({
        data: {},
        sucesss: false,
        description: "Must select between 1 and 10 categories",
      });
    }

    const productOptionals = { ...matched, userId };
    delete productOptionals.quantity;

    const newProduct = new Product(productOptionals);
    const productResult = await newProduct
      .save()
      .catch((err) => console.error(err.message));

    if (!productResult) {
      return res.status(400).send({
        data: {},
        sucesss: false,
        description: "Unsuccessfully created product",
      });
    }

    const newProductInventory = new ProductInventory({
      productId: productResult._id,
      quantity: matched.quantity,
      userId,
    });
    const inventoryResult = await newProductInventory
      .save()
      .catch((err) => console.error(err.message));

    if (!inventoryResult) {
      await Product.findOneAndDelete(productResult._id);

      return res.status(400).send({
        data: {},
        sucesss: false,
        description: "Unsuccessfully created product",
      });
    }

    const results = await Promise.all(
      req.files.map(async (file) => {
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
          _id: new mongoose.Types.ObjectId(productResult._id),
        },
        {
          $push: {
            imageIDs: ImageIDs,
          },
        },
      );
    }

    res.send({
      data: {},
      success: true,
      description: "Successfully created product",
    });
  },
);

module.exports = router;
