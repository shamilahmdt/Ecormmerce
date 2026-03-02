import { createContext, useContext, useEffect, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setBalance(0);
      setLoading(false);
      return;
    }

    try {
      const res = await API.get("/wallet");
      setBalance(res.data.balance || 0);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Wallet fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const addFunds = async (amount) => {
    try {
      const res = await API.post("/wallet/add", { amount });
      setBalance(res.data.balance);
      toast.success("Funds added successfully");
      return res.data.balance;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add funds");
      throw err;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        loading,
        fetchBalance,
        addFunds,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
