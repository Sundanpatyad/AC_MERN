import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaShoppingCart, FaBookOpen } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeFromCart } from '../../../slices/cartSlice'
import toast from 'react-hot-toast'
import { buyItem } from '../../../services/operations/studentFeaturesAPI'

const CourseCard = ({ course, handleAddToCart, handleBuyNow, isInCart, isEnrolled, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleAddToCartClick = (e) => {
    e.preventDefault(); // Prevent navigation
    handleAddToCart(course);
  };

  const handleBuyNowClick = (e) => {
    e.preventDefault(); // Prevent navigation
    handleBuyNow(course);
  };

  return (
    <Link to={`/courses/${course._id}`} className="bg-black border border-gray-800 rounded-lg overflow-hidden shadow-lg">
      <img src={course.thumbnail} alt={course.courseName} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-white mb-2">{course.courseName}</h3>
        <p className="text-gray-400 mb-4 line-clamp-2">{course.courseDescription}</p>
        <div className="flex justify-between items-center text-gray-400 mb-4">
          <span>₹{course.price}</span>
          <span className="flex items-center">
            <FaBookOpen className="mr-1" />
            {course.lessons?.length || 0} lessons
          </span>
        </div>
        <div className="flex flex-col space-y-2">
          {!isLoggedIn ? (
            <Link
              to="/login"
              className="w-full py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 transition duration-300 text-center"
            >
              Login to Purchase
            </Link>
          ) : isEnrolled ? (
            <Link
              to={`/dashboard/enrolled-courses`}
              className="w-full py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 transition duration-300 text-center"
            >
              Go to Course
            </Link>
          ) : (
            <>
              {isInCart ? (
                <Link
                  to="/dashboard/cart"
                  className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition duration-300 text-center"
                >
                  Go to Cart
                </Link>
              ) : (
                <button
                  onClick={handleAddToCartClick}
                  className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition duration-300"
                >
                  <FaShoppingCart className="inline-block mr-2" />
                  Add to Cart
                </button>
              )}
              <button
                onClick={handleBuyNowClick}
                className="w-full py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 transition duration-300"
              >
                Buy Now
              </button>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

const Courses = ({ catalogPageData }) => {
  const [courses, setCourses] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { cart } = useSelector((state) => state.cart)
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  useEffect(() => {
    if (catalogPageData?.selectedCategory?.courses) {
      setCourses(catalogPageData.selectedCategory.courses)
    }
  }, [catalogPageData])

  const handleAddToCart = (course) => {
    if (!isInCart(course)) {
      dispatch(addToCart(course))
      toast.success("Course added to cart")
    }
  }

  const handleBuyNow = async (course) => {
    if (user?.accountType === "Instructor") {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    try {
      await buyItem(token, [course._id], ['course'], user, navigate, dispatch)
    } catch (error) {
      console.error("Error buying course:", error)
      toast.error("Failed to buy the course. Please try again.")
    }
  }

  const filterCourses = (category) => {
    setSelectedCategory(category)
    if (category) {
      const filteredCourses = catalogPageData?.data?.filter(
        (course) => course.category === category
      )
      setCourses(filteredCourses)
    } else {
      setCourses(catalogPageData?.selectedCategory?.courses || [])
    }
  }

  const isEnrolled = (course) => {
    return user && course.studentsEnrolled.includes(user._id)
  }

  const isInCart = (course) => {
    return cart.some((item) => item._id === course._id)
  }

  const isLoggedIn = !!token

  return (
    <div className="container mx-auto px-4 py-8 bg-black text-white">
      <h2 className="text-3xl font-bold mb-6">Our Courses</h2>
      
      {/* Category filter */}
      <div className="mb-6">
        <button
          onClick={() => filterCourses(null)}
          className={`mr-2 mb-2 px-4 py-2 rounded-full ${
            !selectedCategory ? 'bg-white text-black' : 'bg-gray-800 text-white'
          }`}
        >
          All
        </button>
        {catalogPageData?.categories?.map((category) => (
          <button
            key={category}
            onClick={() => filterCourses(category)}
            className={`mr-2 mb-2 px-4 py-2 rounded-full ${
              selectedCategory === category ? 'bg-white text-black' : 'bg-gray-800 text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            handleAddToCart={handleAddToCart}
            handleBuyNow={handleBuyNow}
            isInCart={isInCart(course)}
            isEnrolled={isEnrolled(course)}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>

      {courses.length === 0 && (
        <p className="text-center text-gray-400 mt-8">No courses found.</p>
      )}

      {/* View all courses link */}
      <div className="text-center mt-12">
        <Link
          to="/catalog/mock-tests"
          className="inline-block px-6 py-2 text-sm md:text-xl bg-white text-black rounded-md hover:bg-gray-200 transition duration-300"
        >
          View All Courses
        </Link>
      </div>
    </div>
  )
}

export default Courses