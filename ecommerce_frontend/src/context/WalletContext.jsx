import { createContext, useContext, useEffect, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../api";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingTransactions, setFetchingTransactions] = useState(false);

  const fetchBalance = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setBalance(0);
      setLoading(false);
      return;
    }

    try {
      const res = await API.get("/wallet");
      setBalance(Number(res.data.balance) || 0);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Wallet fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      setFetchingTransactions(true);
      const res = await API.get("/wallet/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setFetchingTransactions(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();

    const socket = io(SOCKET_URL);
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser && loggedInUser.phone) {
      socket.on("wallet-updated", (data) => {
        if (data.userPhone === loggedInUser.phone) {
          setBalance(Number(data.newBalance));
          fetchTransactions(); // Auto-refresh history on any update
        }
      });
    }

    return () => socket.disconnect();
  }, []);

  const addFunds = async (amount) => {
    try {
      const res = await API.post("/wallet/add", { amount });
      setBalance(res.data.balance);
      fetchTransactions();
      toast.success("Funds added successfully");
      return res.data.balance;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add funds");
      throw err;
    }
  };

  const withdrawFunds = async (amount) => {
    try {
      const res = await API.post("/wallet/withdraw", { amount });
      setBalance(res.data.balance);
      fetchTransactions();
      toast.success("Funds withdrawn successfully");
      return res.data.balance;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to withdraw funds");
      throw err;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        loading,
        fetchingTransactions,
        fetchBalance,
        fetchTransactions,
        addFunds,
        withdrawFunds,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
