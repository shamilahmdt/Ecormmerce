const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticate, isAdmin } = require("../middleware/auth");

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.post("/", authenticate, isAdmin, productController.addProduct);
router.put("/:id", authenticate, isAdmin, productController.updateProduct);
router.delete("/:id", authenticate, isAdmin, productController.deleteProduct);

module.exports = router;
