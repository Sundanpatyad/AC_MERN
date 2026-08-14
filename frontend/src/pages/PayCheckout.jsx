import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BASE_URL } from "../services/apis";

const openedOrders = new Set();

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PayCheckout() {
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    let cancelled = false;

    const start = async () => {
      const orderId = params.get("order_id");
      const amount = Number(params.get("amount"));
      const key = params.get("key");
      const currency = params.get("currency") || "INR";
      const name = params.get("name") || "";
      const email = params.get("email") || "";
      const contact = params.get("contact") || "";

      if (!orderId || !key || !Number.isFinite(amount) || amount <= 0) {
        setError("This payment link is invalid. Go back and tap Buy again.");
        return;
      }

      if (openedOrders.has(orderId)) return;
      openedOrders.add(orderId);
      startedRef.current = true;

      const loaded = await loadRazorpay();
      if (cancelled) return;
      if (!loaded || !window.Razorpay) {
        openedOrders.delete(orderId);
        startedRef.current = false;
        setError("Could not load Razorpay. Open this page in Chrome and try again.");
        return;
      }

      const prefill = { name, email };
      if (/^\d{10}$/.test(contact)) {
        prefill.contact = contact;
      }

      const paymentObject = new window.Razorpay({
        key,
        amount,
        currency,
        order_id: orderId,
        name: "Awakening Classes",
        description: "Complete your purchase",
        prefill,
        retry: { enabled: true, max_count: 3 },
        timeout: 900,
        redirect: true,
        callback_url: `${BASE_URL}/api/v1/payment/razorpay-callback`,
        handler: function () {
          window.location.replace(`/payment-result?status=success&orderId=${encodeURIComponent(orderId)}`);
        },
        modal: {
          ondismiss: function () {
            window.location.replace(`/payment-result?status=pending&orderId=${encodeURIComponent(orderId)}`);
          },
        },
      });

      paymentObject.on("payment.failed", function () {
        window.location.replace(`/payment-result?status=failed&orderId=${encodeURIComponent(orderId)}`);
      });

      paymentObject.open();
    };

    start();
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-sm text-muted text-center max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <p className="text-sm text-muted">Opening secure checkout…</p>
    </div>
  );
}
