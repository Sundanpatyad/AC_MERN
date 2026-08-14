import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { pollPaymentStatus } from "../services/operations/studentFeaturesAPI";

export default function PaymentResult() {
  const [params] = useSearchParams();
  const { token } = useSelector((state) => state.auth);
  const statusParam = params.get("status") || "pending";
  const orderId = params.get("orderId");
  const [status, setStatus] = useState(statusParam);

  useEffect(() => {
    if (!token || !orderId) return;
    if (statusParam === "success") {
      setStatus("success");
      return;
    }

    let cancelled = false;
    pollPaymentStatus(orderId, token, {
      onPaid: () => {
        if (!cancelled) setStatus("success");
      },
    }).then((paid) => {
      if (!cancelled && paid) setStatus("success");
    });

    return () => {
      cancelled = true;
    };
  }, [statusParam, token, orderId]);

  const copy = useMemo(() => {
    if (status === "success") {
      return {
        title: "Payment successful",
        body: "Your mock test access has been unlocked. You can start from My Tests.",
      };
    }
    if (status === "pending") {
      return {
        title: "Confirming your payment",
        body: "If money was deducted, access usually appears within a minute. Stay on this page or refresh My Tests.",
      };
    }
    return {
      title: "Payment not completed",
      body: "If money was deducted, it is usually reversed automatically. Contact support with your order ID if access is missing.",
    };
  }, [status]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
        <h1 className="text-2xl font-semibold text-fg">{copy.title}</h1>
        <p className="mt-3 text-sm text-muted leading-relaxed">{copy.body}</p>
        {orderId ? (
          <p className="mt-4 text-xs text-subtle break-all">Order ID: {orderId}</p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/dashboard/enrolled-courses" className="btn-primary w-full py-3 text-center rounded-xl">
            Go to my tests
          </Link>
          <Link to="/mocktest" className="text-sm text-muted hover:text-fg">
            Browse mock tests
          </Link>
        </div>
      </div>
    </div>
  );
}
