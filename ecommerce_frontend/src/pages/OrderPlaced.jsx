import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OrderPlaced = () => {
  const navigate = useNavigate();

  // Optional: redirect back to home after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 mx-auto text-green-500 mb-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h1 className="text-2xl font-bold mb-4">Order Placed!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been successfully placed. Thank you for shopping with us!
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-black text-white px-6 py-2 rounded hover:opacity-90 transition"
        >
          Back to Home
        </button>
        <p className="text-gray-400 mt-4 text-sm">
          You will be redirected automatically in 5 seconds.
        </p>
      </div>
    </div>
  );
};

export default OrderPlaced;