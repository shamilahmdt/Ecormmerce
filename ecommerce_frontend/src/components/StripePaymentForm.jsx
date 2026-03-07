import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ScaleLoader } from "react-spinners";

const StripePaymentForm = ({ amount, onCancel, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <PaymentElement />
      </div>

      {message && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center">
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-gray-100 text-gray-400 hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          disabled={isLoading || !stripe || !elements}
          className="flex-[2] py-4 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <ScaleLoader color="#fff" height={10} width={2} /> : `Pay ₹${amount}`}
        </button>
      </div>
    </form>
  );
};

export default StripePaymentForm;
