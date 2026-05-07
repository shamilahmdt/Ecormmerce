const { db } = require("../config/firebase");

const getBalance = async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.user.phone).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });
    res.json({ balance: doc.data().walletBalance || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const snapshot = await db.collection("transactions")
      .where("userPhone", "==", req.user.phone)
      .get();
    
    const transactions = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
      
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addFunds = (io) => async (req, res) => {
  const { amount } = req.body;
  try {
    const userRef = db.collection("users").doc(req.user.phone);
    const doc = await userRef.get();
    const newBalance = (doc.data().walletBalance || 0) + amount;
    
    await userRef.update({ walletBalance: newBalance });
    
    const txnRef = await db.collection("transactions").add({
      userPhone: req.user.phone,
      type: "Credit",
      description: "Added Funds",
      amount,
      date: new Date().toISOString()
    });

    io.emit("wallet-updated", { userPhone: req.user.phone, newBalance });
    res.json({ balance: newBalance, txnId: txnRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const withdrawFunds = (io) => async (req, res) => {
  const { amount } = req.body;
  try {
    const userRef = db.collection("users").doc(req.user.phone);
    const doc = await userRef.get();
    const currentBalance = doc.data().walletBalance || 0;
    
    if (currentBalance < amount) return res.status(400).json({ error: "Insufficient balance" });
    const newBalance = currentBalance - amount;
    
    await userRef.update({ walletBalance: newBalance });
    
    const txnRef = await db.collection("transactions").add({
      userPhone: req.user.phone,
      type: "Debit",
      description: "Withdraw Funds",
      amount,
      date: new Date().toISOString()
    });

    io.emit("wallet-updated", { userPhone: req.user.phone, newBalance });
    res.json({ balance: newBalance, txnId: txnRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getBalance,
  getTransactions,
  addFunds,
  withdrawFunds
};
