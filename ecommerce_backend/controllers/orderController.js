const { db, admin } = require("../config/firebase");

const createOrder = (io) => async (req, res) => {
  const { items, total, walletAmountUsed, couponCode, discountAmount, stripePaymentId } = req.body;
  const userPhone = req.user.phone;
  const userName = req.user.fullName;

  try {
    const batch = db.batch();
    const createdOrders = [];
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const commonTxId = `TXN_${Date.now()}`;

    if (walletAmountUsed > 0) {
      const userRef = db.collection("users").doc(userPhone);
      batch.update(userRef, {
        walletBalance: admin.firestore.FieldValue.increment(-walletAmountUsed)
      });

      const txnRef = db.collection("transactions").doc();
      batch.set(txnRef, {
        id: txnRef.id,
        userPhone,
        type: "Debit",
        description: `Order Payment (${commonTxId})`,
        amount: walletAmountUsed,
        date: new Date().toISOString()
      });
    }

    for (const item of items) {
      const orderId = db.collection("orders").doc().id;
      const displayOrderId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const itemRatio = (item.price * item.quantity) / (total + discountAmount);
      const itemWalletUsed = Math.round(walletAmountUsed * itemRatio);
      const itemDiscount = Math.round(discountAmount * itemRatio);
      const itemCashback = Math.floor(itemWalletUsed * 0.02);
      
      const orderData = {
        orderId,
        displayOrderId,
        id: orderId,
        userPhone,
        userName,
        items: [item],
        productName: item.name || item.title,
        productCategory: item.category || "General",
        productImage: item.imageUrl || item.image || "",
        subtotal: item.price * item.quantity,
        total: (item.price * item.quantity) - itemDiscount,
        walletAmountUsed: itemWalletUsed,
        discountAmount: itemDiscount,
        cashbackEarned: itemCashback,
        status: "Pending",
        paymentMethod: stripePaymentId ? "Stripe" : "COD",
        stripePaymentId,
        couponCode,
        txnId: commonTxId,
        date: new Date().toISOString(),
        CREATED_AT: timestamp
      };

      const orderRef = db.collection("orders").doc(orderId);
      batch.set(orderRef, orderData);
      createdOrders.push(orderData);

      const productRef = db.collection("products").doc(item.id);
      batch.update(productRef, {
        stock: admin.firestore.FieldValue.increment(-item.quantity)
      });
    }

    const totalCashback = createdOrders.reduce((acc, o) => acc + o.cashbackEarned, 0);
    if (totalCashback > 0) {
      const userRef = db.collection("users").doc(userPhone);
      batch.update(userRef, {
        walletBalance: admin.firestore.FieldValue.increment(totalCashback)
      });

      const cbTxnRef = db.collection("transactions").doc();
      batch.set(cbTxnRef, {
        id: cbTxnRef.id,
        userPhone,
        type: "Cashback",
        description: `Cashback Earned (${commonTxId})`,
        amount: totalCashback,
        date: new Date().toISOString()
      });
    }

    await batch.commit();

    createdOrders.forEach(order => io.emit("new-order", order));
    res.status(201).json({ orders: createdOrders });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOrders = async (req, res) => {
  const { page = 1, limit = 10, date } = req.query;
  try {
    let query = db.collection("orders");
    
    if (req.user.role !== "admin") {
      query = query.where("userPhone", "==", req.user.phone);
    }
    
    if (date) {
      query = query.where("date", ">=", `${date}T00:00:00Z`).where("date", "<=", `${date}T23:59:59Z`);
    }

    const snapshot = await query.get();
    const totalCount = snapshot.size;
    
    const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const startIdx = (page - 1) * limit;
    const orders = allOrders.slice(startIdx, startIdx + parseInt(limit));

    res.json({ orders, totalCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const orderAction = (io) => async (req, res) => {
  const { orderId, type, reason } = req.body;
  try {
    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) {
      const snap = await db.collection("orders").where("displayOrderId", "==", orderId).get();
      if (snap.empty) return res.status(404).json({ error: "Order not found" });
      const doc = snap.docs[0];
      await processAction(doc.ref, doc.data(), type, reason, io);
    } else {
      await processAction(orderRef, orderDoc.data(), type, reason, io);
    }
    res.json({ message: "Action processed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function processAction(ref, data, type, reason, ioInstance) {
  const updates = {};
  if (type === "cancel") {
    updates.status = "Cancelled";
    updates.cancelReason = reason;
    
    const refundAmount = Math.round(data.total * 0.98);
    await db.collection("users").doc(data.userPhone).update({
      walletBalance: admin.firestore.FieldValue.increment(refundAmount)
    });
    
    const item = data.items[0];
    await db.collection("products").doc(item.id).update({
      stock: admin.firestore.FieldValue.increment(item.quantity)
    });
  } else if (type === "return") {
    updates.status = "ReturnProduct";
    updates.returnReason = reason;
  }
  
  await ref.update(updates);
  ioInstance.emit("order-status-updated", { 
    orderId: data.id, 
    displayOrderId: data.displayOrderId, 
    status: updates.status, 
    total: data.total 
  });
}

const updateOrderStatus = (io) => async (req, res) => {
  const { orderId } = req.params;
  const { status, cancelReason } = req.body;

  try {
    let orderRef = db.collection("orders").doc(orderId);
    let orderDoc = await orderRef.get();
    if (!orderDoc.exists) {
      const snap = await db.collection("orders").where("displayOrderId", "==", orderId).get();
      if (snap.empty) return res.status(404).json({ error: "Order not found" });
      orderDoc = snap.docs[0];
      orderRef = orderDoc.ref;
    }
    const orderData = orderDoc.data();
    const oldStatus = orderData.status;

    const updates = { status };
    if (status === "Cancelled") {
      updates.cancelReason = cancelReason || "";
      // If it wasn't already cancelled, restore the stock
      if (oldStatus !== "Cancelled") {
        const item = orderData.items?.[0];
        if (item && item.id) {
          await db.collection("products").doc(item.id).update({
            stock: admin.firestore.FieldValue.increment(item.quantity)
          });
        }
      }
    }

    if (status === "Refunded" && oldStatus !== "Refunded") {
      // Refund to wallet
      const userRef = db.collection("users").doc(orderData.userPhone);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const currentBalance = userDoc.data().walletBalance || 0;
        const newBalance = currentBalance + orderData.total;
        await userRef.update({ walletBalance: newBalance });

        // Record transaction
        await db.collection("transactions").add({
          userPhone: orderData.userPhone,
          type: "Credit",
          description: `Refund for Order #${orderData.displayOrderId || orderData.id}`,
          amount: orderData.total,
          date: new Date().toISOString()
        });

        // Emit socket event for wallet update
        io.emit("wallet-updated", { userPhone: orderData.userPhone, newBalance });
      }
    }

    await orderRef.update(updates);

    // Emit order status update to socket.io
    io.emit("order-status-updated", {
      orderId: orderData.id,
      displayOrderId: orderData.displayOrderId,
      status,
      total: orderData.total
    });

    res.json({ message: "Order status updated successfully", order: { ...orderData, ...updates } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  orderAction,
  updateOrderStatus
};
