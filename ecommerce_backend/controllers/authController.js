const { db } = require("../config/firebase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { fullName, phone, password, role } = req.body;
  try {
    const userRef = db.collection("users").doc(phone);
    const doc = await userRef.get();
    if (doc.exists) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      fullName,
      phone,
      password: hashedPassword,
      role: role || "user",
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    };

    await userRef.set(userData);
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const userRef = db.collection("users").doc(phone);
    const doc = await userRef.get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });

    const user = doc.data();
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const payload = { phone: user.phone, role: user.role, fullName: user.fullName };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, refreshToken, user: { fullName: user.fullName, phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newToken = jwt.sign({ phone: decoded.phone, role: decoded.role, fullName: decoded.fullName }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

const getProfile = async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.user.phone).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });
    const user = doc.data();
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { fullName, address, profileImage, newPassword } = req.body;
  try {
    const updates = { fullName, address, profileImage, updatedAt: new Date().toISOString() };
    if (newPassword) {
      updates.password = await bcrypt.hash(newPassword, 10);
    }
    await db.collection("users").doc(req.user.phone).update(updates);
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const logout = (req, res) => {
  res.json({ message: "Logout successful" });
};

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  logout
};
