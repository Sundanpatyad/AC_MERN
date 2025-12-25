import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../services/operations/profileAPI"
import InstructorChart from "./InstructorDashboard/InstructorChart"
import Img from './../../common/Img'
import { fetchInstructorMockTest } from "../../../services/operations/mocktest"

export default function Instructor() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState(null)
  const [courses, setCourses] = useState([])
  const [mockTests, setMockTests] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [instructorApiData, coursesResult, mockTestsResult] = await Promise.all([
          getInstructorData(token),
          fetchInstructorCourses(token),
          fetchInstructorMockTest(token)
        ])

        if (instructorApiData.length) setInstructorData(instructorApiData)
        if (coursesResult) setCourses(coursesResult)
        if (mockTestsResult) setMockTests(mockTestsResult)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const totalAmount = instructorData?.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0) || 0
  const totalStudents = instructorData?.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0) || 0

  const SkeletonLoader = ({ type }) => (
    <div className="mt-8 w-full">
      <div className="rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6">
        <div className="w-full">
          <div className="w-[150px] h-6 rounded-lg skeleton mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-[280px] w-full rounded-xl skeleton"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const ContentSection = ({ title, items, renderItem, emptyMessage, createLink, createLinkText }) => (
    <div className={`rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 sm:p-8 shadow-2xl ${title === "Mock Tests" ? "mt-8" : ""}`}>
      {items.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Your {title}
            </h2>
            <Link to={`/dashboard/my-${title.toLowerCase().replace(' ', '-')}`}>
              <p className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-1">
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </p>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.slice(0, 3).map(renderItem)}
          </div>
        </>
      ) : (
        <div className="py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-xl font-bold text-white mb-2">{emptyMessage}</p>
          <Link to={createLink}>
            <p className="text-base font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200 inline-flex items-center gap-2">
              {createLinkText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </p>
          </Link>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center sm:text-left">
          Hi {user?.firstName} 👋
        </h1>
        <p className="text-base sm:text-lg font-medium text-gray-400 text-center sm:text-left">
          Let's start something new
        </p>
      </div>

      {loading ? (
        <>
          <SkeletonLoader type="Courses" />
          <SkeletonLoader type="Mock Tests" />
        </>
      ) : (
        <>
          {/* Courses Section */}
          <ContentSection
            title="Courses"
            items={courses}
            renderItem={(course) => (
              <div key={course._id} className="group">
                <div className="relative overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                  <div className="relative h-[180px] overflow-hidden">
                    <Img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="text-base font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors duration-200">
                      {course.courseName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{course.studentsEnrolled.length}</span>
                      </div>
                      <span className="text-gray-600">•</span>
                      <div className="flex items-center gap-1 text-green-400 font-medium">
                        <span>₹{course.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            emptyMessage="You have not created any courses yet"
            createLink="/dashboard/add-course"
            createLinkText="Create a course"
          />

          {/* Mock Tests Section */}
          <ContentSection
            title="Mock Tests"
            items={mockTests}
            renderItem={(mockTest) => (
              <div key={mockTest._id} className="group">
                <div className="relative overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                  <div className="relative h-[180px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border-b border-zinc-700/50">
                    <div className="text-center p-6">
                      <svg className="w-16 h-16 mx-auto text-purple-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-white font-medium text-sm line-clamp-2">{mockTest.seriesName}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="text-base font-semibold text-white line-clamp-1 group-hover:text-purple-400 transition-colors duration-200">
                      {mockTest.seriesName}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${mockTest.status === 'published'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                        {mockTest.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {mockTest.mockTests.length} Tests
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400 font-semibold">₹{mockTest.price}</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{mockTest.description}</p>
                  </div>
                </div>
              </div>
            )}
            emptyMessage="You have not created any mock tests yet"
            createLink="/dashboard/add-mock-test"
            createLinkText="Create a mock test"
          />
        </>
      )}
    </div>
  )
}