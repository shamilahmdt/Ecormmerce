const { db } = require("../config/firebase");

const getAnalytics = async (req, res) => {
  const { days = 15 } = req.query;
  try {
    const ordersSnap = await db.collection("orders").get();
    const usersSnap = await db.collection("users").get();
    const productsSnap = await db.collection("products").get();

    const orders = ordersSnap.docs.map(d => d.data());
    const validOrders = orders.filter(o => o.status !== "Cancelled");
    const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
    
    const revenueMap = {};
    const now = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      revenueMap[d.toISOString().split("T")[0]] = 0;
    }

    validOrders.forEach(o => {
      const date = o.date.split("T")[0];
      if (revenueMap[date] !== undefined) {
        revenueMap[date] += o.total;
      }
    });

    const revenueChartData = Object.entries(revenueMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const categoryMap = {};
    validOrders.forEach(o => {
      const cat = o.items[0]?.category || "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + o.total;
    });
    const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    const statusCounts = {};
    orders.forEach(o => statusCounts[o.status] = (statusCounts[o.status] || 0) + 1);

    res.json({
      summary: {
        totalRevenue,
        totalOrders: ordersSnap.size,
        userCount: usersSnap.size,
        productCount: productsSnap.size
      },
      revenueChartData,
      categoryChartData,
      statusCounts,
      recentOrders: orders.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAdminOrders = async (req, res) => {
  const { page = 1, limit = 10, status, date, search } = req.query;
  try {
    const snapshot = await db.collection("orders").get();
    let allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Apply Status Filter
    if (status && status !== "ALL") {
      allOrders = allOrders.filter(o => o.status === status);
    }

    // Apply Date Filter
    if (date) {
      allOrders = allOrders.filter(o => {
        const orderDateStr = o.date || (o.createdAt ? (o.createdAt.toDate ? o.createdAt.toDate().toISOString() : o.createdAt) : null);
        return orderDateStr && orderDateStr.startsWith(date);
      });
    }

    // Apply Search Filter
    if (search) {
      const term = search.toLowerCase().trim();
      allOrders = allOrders.filter(o => {
        const orderIdMatch = (o.orderId && o.orderId.toLowerCase().includes(term)) || 
                             (o.displayOrderId && o.displayOrderId.toLowerCase().includes(term));
        const userMatch = o.userName && o.userName.toLowerCase().includes(term);
        const productMatch = (o.productName && o.productName.toLowerCase().includes(term)) ||
                             (o.items && o.items.some(item => item.name && item.name.toLowerCase().includes(term)));
        return orderIdMatch || userMatch || productMatch;
      });
    }

    // Calculate overall statistics for the matching/filtered orders
    const totalAmount = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalCount = allOrders.length;

    // Sort by date descending
    allOrders.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt?.toDate?.() || a.createdAt || 0);
      const dateB = new Date(b.date || b.createdAt?.toDate?.() || b.createdAt || 0);
      return dateB - dateA;
    });

    // Pagination
    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const orders = allOrders.slice(startIdx, startIdx + parseInt(limit));

    res.json({ orders, totalCount, totalAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAnalytics, getAdminOrders };

