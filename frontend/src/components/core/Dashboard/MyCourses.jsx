import { useEffect, useState } from "react"
import { VscAdd } from "react-icons/vsc"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import IconBtn from "../../common/IconBtn"
import CoursesTable from "./InstructorCourses/CoursesTable"
import { fetchInstructorMockTest } from "../../../services/operations/mocktest"
import MockTestsTable from "./InstructorCourses/MockTestTable"
import Footer from "../../common/Footer"

export default function MyCoursesAndTests() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [mockTests, setMockTests] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [coursesResult, mockTestsResult] = await Promise.all([
          fetchInstructorCourses(token),
          fetchInstructorMockTest(token)
        ])

        if (coursesResult) {
          setCourses(coursesResult)
        }
        if (mockTestsResult) {
          setMockTests(mockTestsResult)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="px-4 md:px-6 lg:px-8 pb-12">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            My Courses and Tests
          </h1>
          <p className="text-gray-400 text-sm">Manage your courses and mock tests</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/createStudyMaterial")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <VscAdd size={20} />
            <span>Add PDF</span>
          </button>
          <button
            onClick={() => navigate("/dashboard/add-course")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <VscAdd size={20} />
            <span>Add Course</span>
          </button>
          <button
            onClick={() => navigate("/dashboard/add-mocktest")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <VscAdd size={20} />
            <span>Add Mock Test</span>
          </button>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">My Courses</h2>
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
            {courses?.length || 0}
          </span>
        </div>
        {courses && (
          <CoursesTable
            courses={courses}
            setCourses={setCourses}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>

      {/* Mock Tests Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">My Mock Tests</h2>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">
            {mockTests?.length || 0}
          </span>
        </div>
        {mockTests && (
          <MockTestsTable
            mockTests={mockTests}
            setMockTests={setMockTests}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>

      <Footer />
    </div>
  )
}