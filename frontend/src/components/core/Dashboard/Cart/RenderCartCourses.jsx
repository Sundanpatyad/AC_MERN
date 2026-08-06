import React from "react"
import { FaStar } from "react-icons/fa"
import { RiDeleteBin6Line } from "react-icons/ri"
import ReactStars from "react-rating-stars-component"
import { useDispatch, useSelector } from "react-redux"
import { removeFromCart } from "../../../../slices/cartSlice"
import Img from './../../../common/Img'

export default function RenderCartItems() {
  const { cart } = useSelector((state) => state.cart)
  const dispatch = useDispatch()

  return (
    <div className="flex flex-col gap-3">
      {cart.map((item) => {
        const tags = [item?.category?.name, item?.itemType].filter(Boolean)

        return (
          <div
            key={item._id}
            className="rounded-2xl border border-line bg-surface p-4 sm:p-5"
          >
            <div className="flex gap-4">
              {item.thumbnail && (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-elevated shrink-0">
                  <Img
                    src={item.thumbnail}
                    alt={item?.seriesName || item?.courseName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-medium text-fg line-clamp-2">
                  {item?.courseName || item?.seriesName}
                </h3>

                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-elevated text-[11px] text-muted capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <p className="text-base sm:text-lg font-semibold text-fg">
                    ₹{item?.price}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-subtle">
                    <ReactStars
                      count={5}
                      value={4.5}
                      size={14}
                      edit={false}
                      activeColor="#fbbf24"
                      emptyIcon={<FaStar />}
                      fullIcon={<FaStar />}
                    />
                    ({item?.ratingAndReviews?.length || 0})
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line flex justify-end">
              <button
                onClick={() => dispatch(removeFromCart(item._id))}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-muted hover:text-brand hover:bg-elevated transition-colors"
              >
                <RiDeleteBin6Line size={16} />
                Remove
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
