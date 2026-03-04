import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api";
// import { firestore } from "../firebaseConfig";
// import { doc, setDoc, getDoc } from "firebase/firestore";

// ✅ Create Context
const CartContext = createContext();

// ✅ Custom Hook
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const token = localStorage.getItem("token");

  // Load cart from Firebase or LocalStorage on mount
  const fetchCart = async () => {
    const activeToken = localStorage.getItem("token");
    if (!activeToken) {
      // Guest mode: load from localStorage
      const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
      setCart(guestCart);
      return;
    }
    
    try {
      const res = await API.get("/cart");
      setCart(res.data.items || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Error fetching cart:", err);
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Sync cart to Firebase or LocalStorage whenever it changes
  const syncCart = async (newCart) => {
    setCart(newCart);
    const activeToken = localStorage.getItem("token");
    if (!activeToken) {
      // Guest mode: save to localStorage
      localStorage.setItem("guestCart", JSON.stringify(newCart));
      return;
    }

    try {
      await API.post("/cart", { items: newCart });
    } catch (err) {
      console.error("Error syncing cart:", err);
    }
  };

  // Merge guest cart to user cart upon login
  const mergeCart = async () => {
    const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
    if (guestCart.length === 0) {
      fetchCart(); // Just fetch logged in cart
      return;
    }

    try {
      // Fetch current logged-in cart first
      const res = await API.get("/cart");
      const userCart = res.data.items || [];
      
      // Merge logic: Combine and avoid duplicates, update quantities
      let merged = [...userCart];
      guestCart.forEach(gItem => {
        const existing = merged.find(uItem => uItem.id === gItem.id);
        if (existing) {
          existing.quantity += gItem.quantity;
        } else {
          merged.push(gItem);
        }
      });

      await API.post("/cart", { items: merged });
      setCart(merged);
      localStorage.removeItem("guestCart");
    } catch (err) {
      console.error("Error merging cart:", err);
      fetchCart();
    }
  };
  
  // ✅ Add to cart
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === (product.id || product.productId));
    let newCart;

    if (existing) {
      newCart = cart.map((item) =>
        item.id === (product.id || product.productId)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, id: product.id || product.productId, quantity: 1 }];
    }

    syncCart(newCart);
  };

  // ✅ Update quantity
  const updateQuantity = (id, qty) => {
    let newCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: qty < 0 ? 0 : qty } : item
    );
    newCart = newCart.filter((item) => item.quantity > 0); // remove 0 qty
    syncCart(newCart);
  };

  // ✅ Remove single item
  const removeFromCart = (id) => {
    const newCart = cart.filter((item) => item.id !== id);
    syncCart(newCart);
  };

  // ✅ Clear entire cart
  const clearCart = () => {
    syncCart([]);
  };

  // ✅ Total price
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        total,
        mergeCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};