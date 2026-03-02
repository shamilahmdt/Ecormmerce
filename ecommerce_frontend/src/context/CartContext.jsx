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
  const user = JSON.parse(localStorage.getItem("loggedInUser")); // user must be logged in

  // Firebase document reference per user
  // const cartDocRef = user ? doc(firestore, "carts", user.phone) : null;

  // Load cart from Firebase on mount
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCart([]);
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

    fetchCart();
  }, []);

  // Sync cart to Firebase whenever it changes
  const syncCart = async (newCart) => {
    setCart(newCart);
    try {
      await API.post("/cart", { items: newCart });
    } catch (err) {
      console.error("Error syncing cart:", err);
    }
  };
  
  // ✅ Add to cart
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    let newCart;

    if (existing) {
      newCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};