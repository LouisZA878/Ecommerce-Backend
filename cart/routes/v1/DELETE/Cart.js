const router = require("express").Router();
const { Types } = require("mongoose");

const Auth = require("../../../components/middleware/Auth");
const validationResult = require("../../../components/middleware/ValidationArray");
const {
  Id,
  quantity,
  matchedData,
} = require("../../../components/validators/Output");

const CartProducts = require("../../../models/CartProducts");

router.delete(
  "/cart/remove",
  Auth,
  [Id().isIdValid()],
  validationResult("Must provide valid inputs"),
  async (req, res) => {
    try {
      const { id } = matchedData(req);
      const result = await CartProducts.findOneAndDelete({
        productId: new Types.ObjectId(id),
      });

      if (!result) {
        return res.status(400).send({
          data: {},
          success: false,
          description: "Could not remove product from your cart",
        });
      }

      res.status(200).send({
        data: {},
        success: false,
        description: "Successfully removed product from cart",
      });
    } catch (err) {
      console.error(err.message);
      res.status(400).send({
        data: {},
        success: false,
        description: "Could not remove product from your cart",
      });
    }
  },
);

module.exports = router;
