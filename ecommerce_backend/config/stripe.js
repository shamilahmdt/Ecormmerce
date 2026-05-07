const stripe = require("stripe");
const dotenv = require("dotenv");

dotenv.config();

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripeInstance;
