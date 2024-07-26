import React from "react"
import copy from "copy-to-clipboard"
import { toast } from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"

import { addToCart } from "../../../slices/cartSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import Img from './../../common/Img';

function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course

  const handleShare = () => {
    copy(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    if (token) {
      dispatch(addToCart(course))
      toast.success("Course added to cart")
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-richblack-700 p-4 text-richblack-5 w-full max-w-[400px] mx-auto lg:mx-0">
      <Img
        src={ThumbnailImage}
        alt={course?.courseName}
        className="w-full aspect-video rounded-2xl object-cover"
      />

      <div className="px-4">
        <div className="space-x-3 pb-4 text-3xl font-semibold">
          Rs. {CurrentPrice}
        </div>
        <div className="flex flex-col gap-4">
          <button
            className="yellowButton outline-none  w-full py-3 rounded-md"
            onClick={
              user && course?.studentsEnrolled.includes(user?._id)
                ? () => navigate("/dashboard/enrolled-courses")
                : handleBuyCourse
            }
          >
            {user && course?.studentsEnrolled.includes(user?._id)
              ? "Go To Course"
              : "Buy Now"}
          </button>
          {(!user || !course?.studentsEnrolled.includes(user?._id)) && (
            <button 
              onClick={handleAddToCart} 
              className="blackButton outline-none w-full py-3 rounded-md"
            >
              Add to Cart
            </button>
          )}
        </div>

        <p className="pb-3 pt-6 text-center text-sm text-richblack-25">
          30-Day Money-Back Guarantee
        </p>

        <div>
          <p className="my-2 text-xl font-semibold">
            Course Requirements:
          </p>
          <div className="flex flex-col gap-3 text-sm text-caribbeangreen-100">
            {course?.instructions?.map((item, i) => (
              <p className="flex gap-2" key={i}>
                <BsFillCaretRightFill className="mt-1 flex-shrink-0" />
                <span>{item}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            className="mx-auto flex items-center gap-2 py-2 px-4 text-yellow-100 hover:bg-richblack-600 rounded-md transition-all duration-200"
            onClick={handleShare}
          >
            <FaShareSquare size={15} /> Share
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailsCard