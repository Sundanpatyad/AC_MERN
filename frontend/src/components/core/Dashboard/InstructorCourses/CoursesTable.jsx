import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import { FaCheck } from "react-icons/fa"
import { FiEdit2 } from "react-icons/fi"
import { HiClock } from "react-icons/hi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useNavigate } from "react-router-dom"
import { formatDate } from "../../../../services/formatDate"
import { deleteCourse, fetchInstructorCourses, } from "../../../../services/operations/courseDetailsAPI"
import { COURSE_STATUS } from "../../../../utils/constants"
import ConfirmationModal from "../../../common/ConfirmationModal"
import Img from './../../../common/Img';
import toast from 'react-hot-toast'

export default function CoursesTable({ courses, setCourses, loading, setLoading }) {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const TRUNCATE_LENGTH = 30

  const handleCourseDelete = async (courseId) => {
    setLoading(true)
    const toastId = toast.loading('Deleting...');
    await deleteCourse({ courseId: courseId }, token)
    const result = await fetchInstructorCourses(token)
    if (result) {
      setCourses(result)
    }
    setConfirmationModal(null)
    setLoading(false)
    toast.dismiss(toastId)
  }

  const SkeletonCard = () => {
    return (
      <div className="rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className='h-48 w-full md:w-64 rounded-xl skeleton'></div>
          <div className="flex flex-col flex-1 gap-3">
            <div className="h-6 w-3/4 rounded-lg skeleton"></div>
            <div className="h-4 w-full rounded-lg skeleton"></div>
            <div className="h-4 w-5/6 rounded-lg skeleton"></div>
            <div className="flex gap-2 mt-auto">
              <div className="h-8 w-24 rounded-lg skeleton"></div>
              <div className="h-8 w-24 rounded-lg skeleton"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!loading && courses?.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-zinc-800 border border-zinc-700">
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-gray-300 text-xl font-medium">No courses found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first course to get started</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {courses?.map((course) => (
          <div
            key={course._id}
            className="group rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 shadow-2xl hover:border-zinc-600/50 transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Course Thumbnail */}
              <div className="relative lg:w-80 flex-shrink-0">
                <Img
                  src={course?.thumbnail}
                  alt={course?.courseName}
                  className="h-48 w-full rounded-xl object-cover"
                />
                {/* Status Badge on Image */}
                <div className="absolute top-3 right-3">
                  {course.status === COURSE_STATUS.DRAFT ? (
                    <div className="flex items-center gap-2 rounded-full bg-yellow-500/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-black">
                      <HiClock size={14} />
                      Draft
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-full bg-green-500/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-black">
                      <FaCheck size={12} />
                      Published
                    </div>
                  )}
                </div>
              </div>

              {/* Course Details */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 capitalize line-clamp-1">
                    {course.courseName}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                    {course.courseDescription.split(" ").length > TRUNCATE_LENGTH
                      ? course.courseDescription.split(" ").slice(0, TRUNCATE_LENGTH).join(" ") + "..."
                      : course.courseDescription}
                  </p>

                  {/* Course Meta Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-1.5 rounded-lg bg-blue-500/10">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-300">2hr 30min</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-1.5 rounded-lg bg-green-500/10">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-300 font-semibold">₹{course.price}</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span>Created:</span>
                      <span className="text-gray-400">{formatDate(course?.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Updated:</span>
                      <span className="text-gray-400">{formatDate(course?.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-700/50">
                  <button
                    disabled={loading}
                    onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiEdit2 size={18} />
                    <span>Edit</span>
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => {
                      setConfirmationModal({
                        text1: "Delete this course?",
                        text2: "All the data related to this course will be deleted",
                        btn1Text: !loading ? "Delete" : "Loading...",
                        btn2Text: "Cancel",
                        btn1Handler: !loading ? () => handleCourseDelete(course._id) : () => { },
                        btn2Handler: !loading ? () => setConfirmationModal(null) : () => { },
                      })
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RiDeleteBin6Line size={18} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}