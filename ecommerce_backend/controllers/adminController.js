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

module.exports = { getAnalytics };
