const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate } = require("../middleware/auth");

module.exports = (io) => {
  router.post("/", authenticate, orderController.createOrder(io));
  router.get("/", authenticate, orderController.getOrders);
  router.post("/action", authenticate, orderController.orderAction(io));
  return router;
};
