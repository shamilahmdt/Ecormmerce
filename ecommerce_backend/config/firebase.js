const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

try {
  const serviceAccount = require("../serviceAccountKey.json");
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
