import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiShoppingCart } from "react-icons/fi";
import { motion } from "framer-motion";
import RenderCartCourses from "./RenderCartCourses";
import RenderTotalAmount from "./RenderTotalAmount";

export default function Cart() {
  const { total, totalItems } = useSelector((state) => state.cart);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-black border border-slate-500 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="px-6 sm:px-8 py-6 bg-black flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold">Your Cart</h1>
            <span className="bg-white text-black rounded-full px-4 py-2 text-sm font-semibold">
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {totalItems > 0 ? (
            <div className="p-6 sm:p-8 space-y-8">
              <RenderCartCourses />
              <div className="border-t border-gray-700 pt-6">
                <RenderTotalAmount />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <Link
                  to="/"
                  className="group flex items-center text-slate-400 hover:text-indigo-300 transition-colors duration-200"
                >
                  <FiChevronLeft className="mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
                  Continue Shopping
                </Link>
               
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-10 px-6 sm:px-8"
            >
              <FiShoppingCart className="mx-auto h-24 w-24 text-gray-500" />
              <h2 className="mt-6 text-3xl font-bold text-white">Your cart is empty</h2>
              <p className="mt-3 text-md text-gray-400">Looks like you haven't added any courses yet.</p>
              <Link
                to="/"
                className="mt-8 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                Browse Courses
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}