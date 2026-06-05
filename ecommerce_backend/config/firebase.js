const admin = require("firebase-admin");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

try {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    const localPath = path.join(__dirname, "../serviceAccountKey.json");
    const rootPath = path.join(__dirname, "../../serviceAccountKey.json");

    if (fs.existsSync(localPath)) {
      serviceAccount = require(localPath);
    } else if (fs.existsSync(rootPath)) {
      serviceAccount = require(rootPath);
    } else {
      throw new Error(`Cannot find serviceAccountKey.json at either '${localPath}' or '${rootPath}'`);
    }
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
