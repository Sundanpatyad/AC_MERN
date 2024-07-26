import { useSelector } from "react-redux"
import RenderCartCourses from "./RenderCartCourses"
import RenderTotalAmount from "./RenderTotalAmount"
import { Link } from "react-router-dom"

export default function Cart() {
  const { total, totalItems } = useSelector((state) => state.cart)

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-white">Your Cart</h1>
        
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {totalItems > 0 ? (
            <div className="p-6 space-y-8">
              <div className="flex justify-between items-center">
                <p className="text-2xl font-semibold text-white">
                  {totalItems} {totalItems === 1 ? 'Course' : 'Courses'}
                </p>
                <span className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-full">
                  In Cart
                </span>
              </div>
              <RenderCartCourses />
              <div className="border-t border-gray-700 pt-6">
                <RenderTotalAmount />
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-4 text-xl font-medium text-white">Your cart is empty</p>
              <p className="mt-2 text-white">Looks like you haven't added any courses yet.</p>
              <Link to={"/"} className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-105">
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}