const stripeInstance = require("../config/stripe");
const { db } = require("../config/firebase");

const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "inr",
      payment_method_types: ["card"],
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const redeemCoupon = async (req, res) => {
  const { code, cartTotal } = req.body;
  try {
    const snap = await db.collection("coupons").where("code", "==", code).get();
    if (snap.empty) return res.status(404).json({ error: "Invalid coupon" });
    
    const coupon = snap.docs[0].data();
    if (cartTotal < coupon.minAmount) return res.status(400).json({ error: `Min order ₹${coupon.minAmount} required` });
    
    res.json({ message: "Coupon applied", discountPercentage: coupon.discountPercentage, code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createPaymentIntent, redeemCoupon };
