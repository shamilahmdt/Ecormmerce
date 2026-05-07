const { db } = require("../config/firebase");

const getProducts = async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const doc = await db.collection("products").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Product not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Product name is required for ID Generation" });
    }
    
    const docId = name.trim();
    await db.collection("products").doc(docId).set({
      ...req.body,
      id: docId,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ id: docId, message: "Product added successfully with name-based ID" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const oldId = req.params.id;
    const { name } = req.body;
    
    const productRef = db.collection("products").doc(oldId);
    const doc = await productRef.get();
    
    if (!doc.exists) return res.status(404).json({ error: "Product not found" });

    if (name && name.trim() !== "" && name.trim() !== oldId) {
      const newId = name.trim();
      const newData = { 
        ...doc.data(), 
        ...req.body, 
        id: newId, 
        updatedAt: new Date().toISOString() 
      };
      
      await db.collection("products").doc(newId).set(newData);
      await productRef.delete();
      
      return res.json({ message: "Product updated and migrated to new Name-based ID", id: newId });
    }

    await productRef.update({
      ...req.body,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await db.collection("products").doc(req.params.id).delete();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};
