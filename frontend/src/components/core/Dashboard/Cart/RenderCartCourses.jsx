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
    <div className="flex flex-1 flex-col space-y-8 bg-richblack-900 rounded-2xl p-6 shadow-lg">
      {cart.map((item, indx) => (
        <div
          key={item._id}
          className={`flex flex-col sm:flex-row w-full items-center sm:items-start justify-between gap-6 
            ${indx !== cart.length - 1 && "border-b border-richblack-700 pb-8"}
            ${indx !== 0 && "pt-8"}`}
        >
          <div className="flex flex-1 flex-col sm:flex-row gap-6 w-full">
            {/* Item thumbnail */}
            <div className="relative w-full sm:w-[200px] h-[180px] rounded-xl overflow-hidden group">
              <Img
                src={item ? item.thumbnail : ""}
                alt={item?.itemName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-lg font-semibold">View Details</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3 flex-grow">
              <h3 className="text-xl font-bold text-richblack-5 line-clamp-2">
                {item ? item.seriesName : item.itemName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-richblack-300">
                <span className="px-2 py-1 bg-richblack-700 rounded-full">{item?.category?.name}</span>
                <span className="px-2 py-1 bg-richblack-700 rounded-full">{item?.itemType}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-50 font-semibold">4.5</span>
                <ReactStars
                  count={5}
                  value={item?.ratingAndReviews?.length}
                  size={18}
                  edit={false}
                  activeColor="#ffd700"
                  emptyIcon={<FaStar />}
                  fullIcon={<FaStar />}
                />
                <span className="text-richblack-300 text-sm">
                  ({item?.ratingAndReviews?.length} Ratings)
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto space-y-0 sm:space-y-4">
            <p className="text-3xl font-bold text-yellow-50">
              ₹{item?.price}
            </p>
            <button
              onClick={() => dispatch(removeFromCart(item._id))}
              className="flex items-center gap-x-2 rounded-lg border border-pink-700 bg-pink-700 py-2 px-4 text-white hover:bg-pink-800 transition-all duration-200"
            >
              <RiDeleteBin6Line size={20} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}