const router = require("express").Router();
const { Types } = require("mongoose");

const Auth = require("../../../components/middleware/Auth");
const validationResult = require("../../../components/middleware/ValidationArray");
const {
  Id,
  quantity,
  matchedData,
} = require("../../../components/validators/Output");

const Cart = require("../../../models/Cart");
const CartProducts = require("../../../models/CartProducts");

router.post(
  "/cart/add",
  Auth,
  [Id().isIdValid().isIdExist(), quantity().isNumber()],
  validationResult("Must provide valid inputs"),
  async (req, res) => {
    try {
      const { id, quantity } = matchedData(req);

      const cartId = await Cart.findOne({
        userId: new Types.ObjectId(req.userId),
      }).select("_id");

      const newCartProducts = new CartProducts({
        cartId: cartId._id,
        productId: new Types.ObjectId(id),
        quantity,
      });

      await newCartProducts.save();

      res.status(200).send({
        data: {},
        success: true,
        description: "Successfully updated cart",
      });
    } catch (err) {
      console.error(err.message);
      res.status(400).send({
        data: {},
        success: false,
        description: "Could not access your cart",
      });
    }
  },
);

module.exports = router;
