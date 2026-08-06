import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiShoppingCart } from "react-icons/fi";
import { motion } from "framer-motion";
import RenderCartCourses from "./RenderCartCourses";
import RenderTotalAmount from "./RenderTotalAmount";

export default function Cart() {
  const { totalItems } = useSelector((state) => state.cart);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-fg">
            Your cart
          </h1>
          <p className="mt-1 text-sm text-muted">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors"
        >
          <FiChevronLeft />
          Continue shopping
        </Link>
      </div>

      {totalItems > 0 ? (
        <>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <RenderCartCourses />
            <div className="lg:sticky lg:top-6">
              <RenderTotalAmount />
            </div>
          </div>

          <Link
            to="/"
            className="sm:hidden mt-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors"
          >
            <FiChevronLeft />
            Continue shopping
          </Link>
        </>
      ) : (
        <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-elevated flex items-center justify-center">
            <FiShoppingCart className="w-6 h-6 text-muted" />
          </div>
          <h2 className="mt-5 text-lg font-medium text-fg">Your cart is empty</h2>
          <p className="mt-1.5 text-sm text-muted">
            Browse our mock tests and courses to get started.
          </p>
          <Link to="/mocktest" className="btn-primary mt-6">
            Browse mock tests
          </Link>
        </div>
      )}
    </motion.div>
  );
}
