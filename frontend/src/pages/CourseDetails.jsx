import React, { useEffect, useState } from "react";
import { BiInfoCircle, BiTime } from "react-icons/bi";
import { HiOutlineGlobeAlt, HiOutlineUsers } from "react-icons/hi";
import { MdOutlineVerified } from 'react-icons/md';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import ConfirmationModal from "../components/common/ConfirmationModal";
import Footer from "../components/common/Footer";
import RatingStars from "../components/common/RatingStars";
import Img from './../components/common/Img';
import LoadingSpinner from "../components/core/ConductMockTests/Spinner";

import { formatDate } from "../services/formatDate";
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI";
import { buyItem } from "../services/operations/studentFeaturesAPI";
import GetAvgRating from "../utils/avgRating";
import { ACCOUNT_TYPE } from './../utils/constants';
import { addToCart } from "../slices/cartSlice";

function CourseDetails() {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.profile);
  const { paymentLoading } = useSelector((state) => state.course);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [avgReviewCount, setAvgReviewCount] = useState(0);
  const [expandedSections, setExpandedSections] = useState([]);
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0);
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        const res = await fetchCourseDetails(courseId);
        setCourse(res.data.courseDetails);
        setIsUserEnrolled(res.data.courseDetails.studentsEnrolled.includes(user?._id));
        setAvgReviewCount(GetAvgRating(res.data.courseDetails.ratingAndReviews));
        setTotalNoOfLectures(res.data.courseDetails.courseContent.reduce((acc, section) => acc + section.subSection.length, 0));
      } catch (error) {
        console.error("Could not fetch Course Details", error);
        toast.error("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, user]);

  const handleBuyCourse = () => {
    if (token) {
      buyItem(token, [course._id], ['course'], user, navigate, dispatch)
      return;
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to Purchase Course.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  const handleAddToCart = () => {
    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't buy courses.");
      return;
    }
    if (token) {
      dispatch(addToCart(course));
      return;
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add to cart.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (isLoading || loading || paymentLoading) {
    return <LoadingSpinner />;
  }

  if (!course) {
    return <div className="text-center py-10 text-xl">Course not found</div>;
  }

  return (
    <div className="bg-black text-richblack-5">
      {/* Hero Section */}
      <section className="bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.courseName}</h1>
              <p className="text-richblack-200 mb-6">{course.courseDescription}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                <span className="flex items-center">
                  <RatingStars Review_Count={5} Star_Size={20} />
                  <span className="ml-2">({course.ratingAndReviews.length} reviews)</span>
                </span>
                <span className="flex items-center"><HiOutlineUsers className="mr-2" />{course.studentsEnrolled.length} students</span>
              </div>
              <p className="mb-4">Created by <span className="font-semibold">{course.instructor.firstName} {course.instructor.lastName}</span></p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center"><BiInfoCircle className="mr-2" />Last updated {formatDate(course.createdAt)}</span>
                <span className="flex items-center"><HiOutlineGlobeAlt className="mr-2" />English</span>
              </div>
            </div>
            <div className="md:w-1/3">
              <div className="bg-richblack-700 rounded-lg p-6">
                <Img src={course.thumbnail} alt={course.courseName} className="w-full h-48 object-cover rounded-lg mb-4" />
                <p className="text-3xl font-bold mb-4">{course.price === 0 ? "Free" : `₹${course.price}`}</p>
                {isUserEnrolled ? (
                  <button 
                    onClick={() => navigate("/dashboard/enrolled-courses")}
                    className="w-full bg-slate-50 text-richblack-900 rounded-md py-3 font-semibold hover:bg-slate-100 transition duration-300"
                  >
                    Go to Course
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleBuyCourse}
                      className="w-full bg-slate-50 text-richblack-900 rounded-md py-3 font-semibold hover:bg-slate-100 transition duration-300 mb-4"
                    >
                      Buy Now
                    </button>
                    <button 
                      onClick={handleAddToCart}
                      className="w-full bg-richblack-800 text-richblack-5 rounded-md py-3 font-semibold hover:bg-richblack-700 transition duration-300"
                    >
                      Add to Cart
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">What you'll learn</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {course.whatYouWillLearn.split('\n').map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-slate-50 mr-2">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold mb-6">Course Content</h2>
          <div className="mb-4">
            <p>{course.courseContent.length} sections • {totalNoOfLectures} lectures • {course.totalDuration} total length</p>
          </div>
          {course.courseContent.map((section, index) => (
            <div key={index} className="border border-richblack-600 rounded-md mb-4">
              <button 
                className="flex justify-between items-center w-full p-4 text-left"
                onClick={() => toggleSection(section._id)}
              >
                <span className="font-semibold">{section.sectionName}</span>
                <span>{expandedSections.includes(section._id) ? '−' : '+'}</span>
              </button>
              {expandedSections.includes(section._id) && (
                <div className="p-4 bg-richblack-900">
                  {section.subSection.map((lecture, lectureIndex) => (
                    <div key={lectureIndex} className="flex items-center py-2">
                      <BiTime className="mr-2" />
                      <span>{lecture.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Instructor */}
      <section className="py-12 bg-richblack-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Instructor</h2>
          <div className="flex items-center gap-4">
            <Img
              src={course.instructor.image}
              alt={`${course.instructor.firstName} ${course.instructor.lastName}`}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-xl flex items-center">
                {course.instructor.firstName} {course.instructor.lastName}
                <MdOutlineVerified className="text-slate-50 ml-2" />
              </p>
              <p className="text-richblack-300">{course.instructor.additionalDetails?.about || "Instructor at Awakening Classes"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Confirmation Modal */}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
}

export default CourseDetails;