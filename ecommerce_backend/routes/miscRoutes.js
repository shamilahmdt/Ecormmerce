const express = require("express");
const router = express.Router();
const cartWishlistController = require("../controllers/cartWishlistController");
const miscController = require("../controllers/miscController");
const adminController = require("../controllers/adminController");
const { authenticate, isAdmin } = require("../middleware/auth");

// Cart
router.get("/cart", authenticate, cartWishlistController.getCart);
router.post("/cart", authenticate, cartWishlistController.syncCart);

// Wishlist
router.get("/wishlist", authenticate, cartWishlistController.getWishlist);
router.post("/wishlist", authenticate, cartWishlistController.toggleWishlist);
router.delete("/wishlist/:productId", authenticate, cartWishlistController.removeFromWishlist);
router.delete("/wishlist", authenticate, cartWishlistController.clearWishlist);

// Admin
router.get("/admin/analytics", authenticate, isAdmin, adminController.getAnalytics);
router.get("/admin/orders", authenticate, isAdmin, adminController.getAdminOrders);

// Payments & Coupons
router.post("/payment/create-intent", authenticate, miscController.createPaymentIntent);
router.post("/coupons/redeem", authenticate, miscController.redeemCoupon);

module.exports = router;
