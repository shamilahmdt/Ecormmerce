const { db } = require("../config/firebase");

// Cart
const getCart = async (req, res) => {
  try {
    const doc = await db.collection("carts").doc(req.user.phone).get();
    if (!doc.exists) return res.json({ items: [] });
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const syncCart = async (req, res) => {
  const { items } = req.body;
  try {
    await db.collection("carts").doc(req.user.phone).set({ items, updatedAt: new Date().toISOString() });
    res.json({ message: "Cart synced" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Wishlist
const getWishlist = async (req, res) => {
  try {
    const doc = await db.collection("wishlists").doc(req.user.phone).get();
    if (!doc.exists) return res.json({ items: [] });
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleWishlist = async (req, res) => {
  const { productId, title, price, image } = req.body;
  try {
    const wishlistRef = db.collection("wishlists").doc(req.user.phone);
    const doc = await wishlistRef.get();
    let items = doc.exists ? doc.data().items : [];

    const index = items.findIndex(item => item.productId === productId);
    if (index > -1) {
      items.splice(index, 1);
    } else {
      items.push({ productId, title, price, image, addedAt: new Date().toISOString() });
    }

    await wishlistRef.set({ items, updatedAt: new Date().toISOString() });
    res.json({ items, message: "Wishlist updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const wishlistRef = db.collection("wishlists").doc(req.user.phone);
    const doc = await wishlistRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Wishlist not found" });

    let items = doc.data().items.filter(item => item.productId !== req.params.productId);
    await wishlistRef.update({ items, updatedAt: new Date().toISOString() });
    res.json({ items, message: "Item removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const clearWishlist = async (req, res) => {
  try {
    await db.collection("wishlists").doc(req.user.phone).set({ items: [], updatedAt: new Date().toISOString() });
    res.json({ items: [], message: "Wishlist cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCart,
  syncCart,
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist
};
