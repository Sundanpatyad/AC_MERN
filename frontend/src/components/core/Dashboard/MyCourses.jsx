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
    <div className="px-4 md:px-6 lg:px-8">
      <div className="mb-8 md:mb-14 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-medium text-richblack-5 font-boogaloo text-center mb-4 md:mb-0">
          My Courses and Tests
        </h1>
        <div className="flex flex-col sm:flex-row gap-4">
        <IconBtn
            text="Add Pdf"
            onclick={() => navigate("/createStudyMaterial")}
          >
            <VscAdd />
          </IconBtn>
          <IconBtn
            text="Add Course"
            onclick={() => navigate("/dashboard/add-course")}
          >
            <VscAdd />
          </IconBtn>
          <IconBtn
            text="Add Mock Test"
            onclick={() => navigate("/dashboard/add-mocktest")}
          >
            <VscAdd />
          </IconBtn>
        </div>
      </div>

      {/* Courses Table */}
      <div className="mb-8 md:mb-10">
        <h2 className="text-xl md:text-2xl font-medium text-richblack-5 mb-4">My Courses</h2>
        {courses && (
          <CoursesTable
            courses={courses}
            setCourses={setCourses}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>

      {/* Mock Tests Table */}
      <div>
        <h2 className="text-xl md:text-2xl font-medium text-richblack-5 mb-4">My Mock Tests</h2>
        {mockTests && (
          <MockTestsTable
            mockTests={mockTests}
            setMockTests={setMockTests}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>
      <Footer/>
    </div>
  )
}