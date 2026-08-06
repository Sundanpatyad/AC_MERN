import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
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
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-sm font-medium text-fg">Order summary</h2>

      <div className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">
            Items ({cart.length})
          </span>
          <span className="text-fg">₹{total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Discount</span>
          <span className="text-fg">₹0</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-line flex items-baseline justify-between">
        <span className="text-sm text-muted">Total</span>
        <span className="text-2xl font-semibold text-fg">₹{total.toLocaleString()}</span>
      </div>

      <button onClick={handleBuyCourse} className="btn-primary w-full mt-5">
        Buy now
      </button>

      <p className="mt-3 flex items-center justify-center gap-1 text-xs text-subtle">
        Secure checkout by <SiRazorpay /> Razorpay
      </p>
    </div>
  )
}
