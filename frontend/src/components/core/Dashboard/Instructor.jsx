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
    <div className="mt-5 w-full flex flex-col justify-between rounded-xl">
      <div className="flex border p-4 border-richblack-600">
        <div className="w-full">
          <p className="w-[100px] h-4 rounded-xl skeleton"></p>
          <div className="mt-3 flex gap-x-5">
            <p className="w-[200px] h-4 rounded-xl skeleton"></p>
            <p className="w-[100px] h-4 rounded-xl skeleton"></p>
          </div>
          <div className="flex justify-center items-center flex-col">
            <div className="w-[80%] h-24 rounded-xl mt-5 skeleton"></div>
            <div className="w-60 h-60 rounded-full mt-4 grid place-items-center skeleton"></div>
          </div>
        </div>
        <div className="sm:flex hidden min-w-[250px] flex-col rounded-xl p-6 skeleton"></div>
      </div>
      <div className="flex flex-col gap-y-6 mt-5">
        <div className="flex justify-between">
          <p className="text-lg font-bold text-richblack-5 pl-5">Your {type}</p>
          <Link to={`/dashboard/my-${type.toLowerCase()}`}>
            <p className="text-xs font-semibold text-yellow-50 hover:underline pr-5">View All</p>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row gap-6">
          {[1, 2, 3].map((item) => (
            <p key={item} className="h-[201px] w-full rounded-xl skeleton"></p>
          ))}
        </div>
      </div>
    </div>
  )

  const ContentSection = ({ title, items, renderItem, emptyMessage, createLink, createLinkText }) => (
    <div className={`rounded-md bg-richblack-800 p-6 ${title === "Mock Tests" ? "mt-10" : ""}`}>
      {items.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-richblack-5">Your {title}</p>
            <Link to={`/dashboard/my-${title.toLowerCase().replace(' ', '-')}`}>
              <p className="text-xs font-semibold text-yellow-50 hover:underline">View All</p>
            </Link>
          </div>
          <div className="my-4 flex flex-col sm:flex-row sm:space-x-6 space-y-6 sm:space-y-0">
            {items.slice(0, 3).map(renderItem)}
          </div>
        </>
      ) : (
        <div className="py-20">
          <p className="text-center text-2xl font-bold text-richblack-5">{emptyMessage}</p>
          <Link to={createLink}>
            <p className="mt-1 text-center text-lg font-semibold text-yellow-50">{createLinkText}</p>
          </Link>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-richblack-5 text-center sm:text-left">
          Hi {user?.firstName} 👋
        </h1>
        <p className="font-medium text-richblack-200 text-center sm:text-left">
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
          <ContentSection
            title="Courses"
            items={courses}
            renderItem={(course) => (
              <div key={course._id} className="sm:w-1/3 flex flex-col items-center justify-center">
                <Img
                  src={course.thumbnail}
                  alt={course.courseName}
                  className="h-[201px] w-full rounded-2xl object-cover"
                />
                <div className="mt-3 w-full">
                  <p className="text-sm font-medium text-richblack-50">{course.courseName}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <p className="text-xs font-medium text-richblack-300">{course.studentsEnrolled.length} students</p>
                    <p className="text-xs font-medium text-richblack-300">|</p>
                    <p className="text-xs font-medium text-richblack-300">Rs. {course.price}</p>
                  </div>
                </div>
              </div>
            )}
            emptyMessage="You have not created any courses yet"
            createLink="/dashboard/add-course"
            createLinkText="Create a course"
          />

          <ContentSection
            title="Mock Tests"
            items={mockTests}
            renderItem={(mockTest) => (
              <div key={mockTest._id} className="sm:w-1/3 flex flex-col items-center justify-center">
                <div className="w-full h-[201px] bg-richblack-700 rounded-2xl flex items-center justify-center">
                  <p className="text-center text-white text-sm font-medium">{mockTest.seriesName}</p>
                </div>
                <div className="mt-3 w-full">
                  <p className="text-sm font-medium text-richblack-50">{mockTest.seriesName}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <p className="text-xs font-medium text-richblack-300">Price: Rs {mockTest.price}</p>
                    <p className="text-xs font-medium text-richblack-300">|</p>
                    <p className="text-xs font-medium text-richblack-300">{mockTest.status}</p>
                  </div> <div className="mt-1 flex items-center space-x-2">
                    <p className="text-xs font-medium text-richblack-300">Mock Test : {mockTest.mockTests.length}</p>
                    <p className="text-xs font-medium text-richblack-300">|</p>
                    <p className="text-xs font-medium text-richblack-300"> Description : {mockTest.description}</p>
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