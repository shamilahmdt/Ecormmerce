const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

try {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require("../serviceAccountKey.json");
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin Initialized");
} catch (error) {
  console.error("Firebase Admin Initialization Error:", error);
  process.exit(1);
}

const db = admin.firestore();

module.exports = { admin, db };
