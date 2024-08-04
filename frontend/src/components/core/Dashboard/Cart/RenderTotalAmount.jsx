import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { FaShoppingCart } from "react-icons/fa"
import { motion } from "framer-motion"
import { buyItem } from "../../../../services/operations/studentFeaturesAPI"
import { SiRazorpay } from "react-icons/si";

export default function RenderTotalAmount() {
  const { total, cart } = useSelector((state) => state.cart)
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleBuyCourse = async () => {
    const items = cart.map((item) => item._id)
    const itemType = cart.map((item) => item.itemType)
    await buyItem(token, items, itemType, user, navigate, dispatch)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto rounded-xl border-2 border-slate-500 bg-transparent p-4 sm:p-6 shadow-lg"
    >
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm font-medium text-gray-400">Total Amount:</p>
        <p className="text-2xl sm:text-4xl font-bold text-white">₹ {total.toLocaleString()}</p>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleBuyCourse}
        className="w-full bg-white text-black py-3 px-4  rounded-lg font-semibold text-xs sm:text-lg flex items-center justify-center space-x-2 transition-colors duration-300 hover:bg-black hover:border hover:border-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        <FaShoppingCart className="text-xl" />
        <span>Buy Now</span>
      </motion.button>
      
      <p className="mt-4 text-xs text-center text-gray-500 flex align-center justify-center">
      Secure checkout powered by <SiRazorpay className="inline mx-1 text-blue-200" /> Razorpay
      </p>
    </motion.div>
  )
}