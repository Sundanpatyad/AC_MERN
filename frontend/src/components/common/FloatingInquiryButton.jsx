import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { FiUser, FiPhone, FiMessageSquare, FiSend } from "react-icons/fi";
import toast from "@/utils/toast";
import { submitInquiry } from "../../services/inquiryEmail";

export default function FloatingInquiryButton() {
  const [open, setOpen] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const location = useLocation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: "", phone: "", query: "" },
  });

  const hideOnTest = location.pathname.includes("attempt-test");

  const close = () => {
    if (isSubmitting) return;
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const onSubmit = async (values) => {
    try {
      await submitInquiry({
        name: values.name.trim(),
        phone: values.phone.trim(),
        query: values.query.trim(),
      });
      toast.success("Inquiry sent");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error.message || "Couldn't send inquiry");
    }
  };

  if (hideOnTest) return null;

  // Sit above the mobile bottom tab bar (h-16); desktop has no tab bar.
  const bottomOffset = "bottom-24 md:bottom-8";

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close inquiry"
          className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm"
          onClick={close}
        />
      )}

      <div
        className={`fixed right-5 z-[1000] flex flex-col-reverse items-end gap-3 ${bottomOffset}`}
      >
        <button
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-label="Ask a query"
          aria-expanded={open}
          className="flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-brand-fg shadow-lg shadow-brand/25 transition-transform hover:scale-105 active:scale-95 shrink-0"
        >
          <HiOutlineChatAlt2 size={20} />
          <span className="hidden sm:inline">Any query?</span>
        </button>

        {open && (
          <div
            className="w-[min(calc(100vw-2rem),400px)] animate-[slideUp_0.25s_ease-out] rounded-2xl border border-line bg-surface shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-brand/5 border-b border-line px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="inquiry-title" className="text-lg font-semibold text-fg">
                    Have a query?
                  </h2>
                  <p className="mt-0.5 text-[13px] text-muted">
                    Fill the form and we'll get back to you shortly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  disabled={isSubmitting}
                  className="rounded-full p-1.5 text-muted hover:text-fg hover:bg-elevated transition-colors shrink-0"
                  aria-label="Close"
                >
                  <IoClose size={20} />
                </button>
              </div>
            </div>

            <form className="flex flex-col gap-3.5 p-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inquiry-name" className="text-sm font-medium text-fg">
                  Your name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    id="inquiry-name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    autoFocus
                    className="field"
                    style={{ paddingLeft: "2.5rem" }}
                    {...register("name", {
                      required: "Name is required.",
                      minLength: { value: 2, message: "At least 2 characters." },
                      maxLength: { value: 50, message: "Max 50 characters." },
                    })}
                  />
                </div>
                {errors.name && (
                  <span className="text-xs text-red-500">{errors.name.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="inquiry-phone" className="text-sm font-medium text-fg">
                  Phone number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    id="inquiry-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    className="field"
                    style={{ paddingLeft: "2.5rem" }}
                    {...register("phone", {
                      required: "Phone number is required.",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Enter a valid 10-digit mobile number.",
                      },
                    })}
                  />
                </div>
                {errors.phone && (
                  <span className="text-xs text-red-500">{errors.phone.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="inquiry-query" className="text-sm font-medium text-fg">
                  Your query
                </label>
                <div className="relative">
                  <FiMessageSquare className="absolute left-3 top-3 text-muted" size={16} />
                  <textarea
                    id="inquiry-query"
                    rows={3}
                    placeholder="What would you like to know?"
                    className="field resize-none"
                    style={{ paddingLeft: "2.5rem" }}
                    {...register("query", {
                      required: "Please enter your query.",
                      minLength: { value: 10, message: "At least 10 characters." },
                      maxLength: { value: 1000, message: "Max 1000 characters." },
                    })}
                  />
                </div>
                {errors.query && (
                  <span className="text-xs text-red-500">{errors.query.message}</span>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={close}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <FiSend size={15} />
                      Send
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
