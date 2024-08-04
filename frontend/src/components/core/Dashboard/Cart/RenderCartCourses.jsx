import React from "react"
import { FaStar } from "react-icons/fa"
import { RiDeleteBin6Line } from "react-icons/ri"
import ReactStars from "react-rating-stars-component"
import { useDispatch, useSelector } from "react-redux"
import { removeFromCart } from "../../../../slices/cartSlice"
import Img from './../../../common/Img'
import { IoThermometer } from "react-icons/io5"

export default function RenderCartItems() {
  const { cart } = useSelector((state) => state.cart)
  const dispatch = useDispatch()

  return (
    <div className="flex flex-1 flex-col space-y-4 bg-black border border-slate-500 rounded-xl p-4 shadow-lg overflow-hidden">
      {cart.map((item, indx) => (
        <div
          key={item._id}
          className={`flex flex-col w-full gap-4 pb-4
            ${indx !== cart.length - 1 && "border-b border-richblack-700"}`}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Item thumbnail */}
         {
          item.thumbnail && (
            <div className="relative w-full sm:w-[100px] h-[100px] rounded-lg overflow-hidden flex-shrink-0">
            <Img
              src={item ? item.thumbnail : ""}
              alt={item?.seriesName}
              className="w-full h-full object-cover"
            />
          </div>
          )
         }

            <div className="flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-base font-semibold text-white line-clamp-2 mb-1">
                  {item && item.courseName}
                  {item && item.seriesName}
                 
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-richblack-300 mb-2">
                  <span className="px-2 py-1 bg-richblack-700 rounded-full">{item?.category?.name}</span>
                  <span className="px-2 py-1 bg-richblack-700 rounded-full">{item?.itemType}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 sm:mt-0">
                <p className="text-lg font-bold text-yellow-50 mb-2 sm:mb-0">
                  ₹{item?.price}
                </p>
                <div className="flex items-center gap-1">
                  <ReactStars
                    count={5}
                    value={4.5}
                    size={16}
                    edit={false}
                    activeColor="#ffd700"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />
                  <span className="text-richblack-300 text-xs">
                    ({item?.ratingAndReviews?.length})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => dispatch(removeFromCart(item._id))}
            className="flex items-center justify-center gap-x-2 rounded-lg border border-red-700 bg-red-700 py-2 px-3 text-sm text-white hover:bg-pink-800 transition-all duration-200 w-full"
          >
            <RiDeleteBin6Line size={18} />
            <span>Remove</span>
          </button>
        </div>
      ))}
    </div>
  )
}