const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

// Config
dotenv.config();

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const walletRoutes = require("./routes/walletRoutes");
const miscRoutes = require("./routes/miscRoutes");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://ecormmerce-web.vercel.app"
];

if (process.env.FRONTEND_URL) {
  const urls = process.env.FRONTEND_URL.split(",").map(url => url.trim());
  allowedOrigins.push(...urls);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// API Routes
app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes(io));
app.use("/api/wallet", walletRoutes(io));
app.use("/api", miscRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
