const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate, isAdmin } = require("../middleware/auth");

module.exports = (io) => {
  router.post("/", authenticate, orderController.createOrder(io));
  router.get("/", authenticate, orderController.getOrders);
  router.post("/action", authenticate, orderController.orderAction(io));
  router.put("/:orderId", authenticate, isAdmin, orderController.updateOrderStatus(io));
  return router;
};
