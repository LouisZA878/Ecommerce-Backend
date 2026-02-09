const router = require("express").Router();
const { Types } = require("mongoose");

const Auth = require("../../../components/middleware/Auth");
const ValidationArray = require("../../../components/middleware/ValidationArray");

const { KafkaProducer } = require("../../../components/controllers/Kafka");

const Cart = require("../../../models/Cart");

router.get(
  "/cart",
  Auth,
  [],
  ValidationArray("Must provide valid queries"),
  async (req, res) => {
    try {
      const result = await Cart.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(req.userId),
          },
        },
        {
          $lookup: {
            from: "cartproducts",
            localField: "_id",
            foreignField: "cartId",
            as: "products",
          },
        },
        {
          $unset: [
            "_id",
            "userId",
            "products.__v",
            "products.cartId",
            "__v",
            "products._id",
          ],
        },
      ]);
      KafkaProducer("info-message", "Successfully fetched cart details");
      res.status(200).send({
        data: result[0].products,
        success: true,
        description: "Successfully fetched cart details",
      });
    } catch (err) {
      console.error(err.message);
      KafkaProducer("error-message", {
        error: err.message,
        msg: "Could not fetch cart details",
      });
      res.status(200).send({
        data: {},
        success: false,
        description: "Could not fetch cart details",
      });
    }
  },
);

module.exports = router;
