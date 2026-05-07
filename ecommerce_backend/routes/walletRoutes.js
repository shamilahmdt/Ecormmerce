const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { authenticate } = require("../middleware/auth");

module.exports = (io) => {
  router.get("/", authenticate, walletController.getBalance);
  router.get("/transactions", authenticate, walletController.getTransactions);
  router.post("/add", authenticate, walletController.addFunds(io));
  router.post("/withdraw", authenticate, walletController.withdrawFunds(io));
  return router;
};
