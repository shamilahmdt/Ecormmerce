# 🛒 Full-Stack E-Commerce Platform

A premium, full-stack e-commerce solution built with **React**, **Node.js**, **Firebase**, and **Socket.io**. This platform features a sophisticated split-order system, integrated digital wallet with cashback, and real-time administration capabilities.

---

## 🚀 Key Features

### 🛍️ Storefront
- **Dynamic Product Catalog**: Browse products with categories and detailed views.
- **Hybrid Cart System**: Seamlessly switch between Guest and Logged-in states with automatic cart merging.
- **Wishlist**: Save favorite items for later.
- **Smart Checkout**: Integrated with **Stripe** for secure payments and support for **Cash on Delivery (COD)**.

### 💳 Wallet & Cashback
- **Digital Wallet**: Add funds, withdraw, and track transactions.
- **Cashback Logic**: Earn 2% cashback automatically on every order.
- **Smart Refunds**: Automatic wallet refunds on cancellations (98% refund policy).

### ⚡ Real-Time & Advanced Logic
- **Split-Order System**: Orders are intelligently split per item for granular status tracking.
- **Live Notifications**: Real-time updates for order status and wallet balances via **Socket.io**.
- **Coupon System**: Redeem discount codes with minimum order value validation.

### 📊 Admin Dashboard
- **Analytics Visualization**: Interactive charts for revenue, category distribution, and order status using **Recharts**.
- **Inventory Management**: Full CRUD for products with name-based document migration.
- **Order Management**: Process returns, cancellations, and status updates.
- **Export Reports**: Generate PDF and Excel reports for sales and inventory.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **State**: React Context API
- **Icons**: Lucide React + React Icons

### Backend
- **Runtime**: Node.js + Express
- **Database**: Firebase Firestore
- **Auth**: JWT (Access & Refresh Tokens)
- **Real-time**: Socket.io
- **Payments**: Stripe API
- **Images**: Cloudinary

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce
```

### 2. Backend Setup
1. Navigate to `ecommerce_backend/`.
2. Install dependencies: `npm install`.
3. Create a `.env` file with:
   ```env
   PORT=5000
   JWT_SECRET=your_secret
   STRIPE_SECRET_KEY=your_stripe_key
   ```
4. Place your Firebase `serviceAccountKey.json` in the `ecommerce_backend/` root.
5. Start the server: `npm run dev`.

### 3. Frontend Setup
1. Navigate to `ecommerce_frontend/`.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

---

## 📂 Project Structure

```text
ecommerce/
├── ecommerce_backend/      # Express API & Firebase Logic
│   ├── config/             # Firebase & Stripe Init
│   ├── controllers/        # Domain-specific logic
│   ├── middleware/         # Auth & RBAC
│   └── routes/             # API Endpoints
└── ecommerce_frontend/     # React SPA
    ├── src/pages/          # Admin, User, & Guest Pages
    ├── src/context/        # Global state (Cart, Wallet, Wishlist)
    └── src/components/     # Reusable UI Elements
```

---

## 📜 License
This project is licensed under the MIT License.

---
*Developed by [Antigravity](https://github.com/shamilahmdt)*
