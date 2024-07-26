import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getUserEnrolledCourses, getUserAttempts, getUserEnrolledMockTests } from "../../../services/operations/profileAPI"
import Img from './../../common/Img';
import {
  setEnrolledCoursesStart,
  setEnrolledCoursesSuccess,
  setEnrolledCoursesFailure,
  setEnrolledMockTestsStart,
  setEnrolledMockTestsSuccess,
  setEnrolledMockTestsFailure,
  setMockAttemptsStart,
  setMockAttemptsSuccess,
  setMockAttemptsFailure,
} from "../../../slices/enrolledContentSlice"

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const { enrolledCourses, enrolledMockTests, mockAttempts, loading, error } = useSelector((state) => state.enrolledContent)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [showMockAttempts, setShowMockAttempts] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!enrolledCourses && !loading.courses) {
        dispatch(setEnrolledCoursesStart())
        try {
          const res = await getUserEnrolledCourses(token)
          dispatch(setEnrolledCoursesSuccess(res))
        } catch (error) {
          dispatch(setEnrolledCoursesFailure(error.message))
          console.log("Could not fetch enrolled courses.")
        }
      }

      if (!enrolledMockTests && !loading.mockTests) {
        dispatch(setEnrolledMockTestsStart())
        try {
          const res = await getUserEnrolledMockTests(token)
          dispatch(setEnrolledMockTestsSuccess(res))
        } catch (error) {
          dispatch(setEnrolledMockTestsFailure(error.message))
          console.log("Could not fetch enrolled mock tests.")
        }
      }
    }

    fetchData()
  }, [token, dispatch, enrolledCourses, enrolledMockTests, loading.courses, loading.mockTests])

  const getMockAttempts = async () => {
    if (!mockAttempts && !loading.attempts) {
      dispatch(setMockAttemptsStart())
      try {
        const res = await getUserAttempts(token)
        dispatch(setMockAttemptsSuccess(res.attempts))
      } catch (error) {
        dispatch(setMockAttemptsFailure(error.message))
        console.log("Could not fetch mock test attempts.")
      }
    }
  }

  const groupAttemptsBySeriesName = (attempts) => {
    if (!Array.isArray(attempts)) return {};
    return attempts.reduce((acc, attempt) => {
      const seriesName = attempt.mockTestSeries?.seriesName || 'Unknown Series';
      if (!acc[seriesName]) {
        acc[seriesName] = [];
      }
      acc[seriesName].push(attempt);
      return acc;
    }, {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-richblack-900 to-richblack-800 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-600 font-extrabold text-center mb-8">
          Your Learning Journey
        </h1>

        {/* Enrolled Courses Section */}
        <section className="mb-10">
          <h2 className="text-2xl sm:text-3xl text-richblack-5 font-bold mb-4">Enrolled Courses</h2>
          <div className="bg-richblack-800 rounded-xl shadow-lg overflow-hidden">
            {loading.courses ? (
              <p className="text-center text-richblack-300 py-8">Loading enrolled courses...</p>
            ) : error.courses ? (
              <p className="text-center text-red-500 py-8">Error: {error.courses}</p>
            ) : !enrolledCourses || enrolledCourses.length === 0 ? (
              <p className="text-center text-richblack-300 py-8">You haven't enrolled in any courses yet.</p>
            ) : (
              enrolledCourses.map((course, i) => (
                <div key={i} className="flex flex-col p-4 border-b border-richblack-700 hover:bg-richblack-700 transition-all duration-200">
                  <div className="flex items-center space-x-4 cursor-pointer mb-3" onClick={() => navigate(`/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`)}>
                    <Img src={course.thumbnail} alt="course_img" className="h-16 w-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-richblack-5">{course.courseName}</p>
                      <p className="text-sm text-richblack-300 mt-1">{course.courseDescription.slice(0, 50)}...</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-richblack-300 mb-1">Duration: {course?.totalDuration}</p>
                    <p className="text-sm text-richblack-300 mb-2">Progress: {course.progressPercentage || 0}%</p>
                    <ProgressBar completed={course.progressPercentage || 0} height="8px" isLabelVisible={false} bgColor="#60A5FA" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Enrolled Mock Tests Section */}
        <section className="mb-10">
          <h2 className="text-2xl sm:text-3xl text-richblack-5 font-bold mb-4">Enrolled Mock Tests</h2>
          <div className="bg-richblack-800 rounded-xl shadow-lg overflow-hidden">
            {loading.mockTests ? (
              <p className="text-center text-richblack-300 py-8">Loading enrolled mock tests...</p>
            ) : error.mockTests ? (
              <p className="text-center text-red-500 py-8">Error: {error.mockTests}</p>
            ) : !enrolledMockTests || enrolledMockTests.length === 0 ? (
              <p className="text-center text-richblack-300 py-8">You haven't enrolled in any mock tests yet.</p>
            ) : (
              enrolledMockTests.map((mockTest, i) => (
                <div key={i} className="flex flex-col p-4 border-b border-richblack-700 hover:bg-richblack-700 transition-all duration-200">
                  <div className="flex items-center space-x-4 mb-3">
                    <Img src={mockTest.thumbnail} alt="mock_test_img" className="h-16 w-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-white">{mockTest.testName}</p>
                      <p className="text-sm text-richblack-300 mt-1">{mockTest.description.slice(0, 50)}...</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-richblack-300">Rs.{mockTest.price}</p>
                    <p className={`text-sm font-medium ${mockTest.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {mockTest.status === 'draft' ? 'Draft' : 'Published'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Mock Test Attempts Section */}
        <section className="text-center mb-10">
          <button
            onClick={() => {
              setShowMockAttempts(!showMockAttempts)
              if (!mockAttempts) getMockAttempts()
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            {showMockAttempts ? "Hide Mock Test Attempts" : "Show Mock Test Attempts"}
          </button>

          {showMockAttempts && (
            <div className="mt-8">
              <h2 className="text-2xl sm:text-3xl text-richblack-5 font-bold mb-4">Mock Test Attempts</h2>
              {loading.attempts ? (
                <p className="text-center text-richblack-300 py-8">Loading mock test attempts...</p>
              ) : error.attempts ? (
                <p className="text-center text-red-500 py-8">Error: {error.attempts}</p>
              ) : !mockAttempts || mockAttempts.length === 0 ? (
                <p className="text-center text-richblack-300 py-8">You haven't attempted any mock tests yet.</p>
              ) : (
                Object.entries(groupAttemptsBySeriesName(mockAttempts)).map(([seriesName, attempts]) => (
                  <div key={seriesName} className="mt-6 bg-richblack-800 rounded-xl p-4 shadow-lg">
                    <h3 className="text-xl text-richblack-5 font-semibold mb-3">{seriesName}</h3>
                    <div className="grid gap-4">
                      {attempts.map((attempt, index) => (
                        <div key={index} className="bg-richblack-700 rounded-lg p-4 hover:bg-richblack-600 transition-all duration-200">
                          <p className="text-richblack-5 font-semibold mb-2">{attempt.testName}</p>
                          <p className="text-richblack-300 text-sm mb-2">{new Date(attempt.createdAt).toLocaleDateString()}</p>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-richblack-300">Score: {attempt.score} / {attempt.totalQuestions}</p>
                            <p className="text-richblack-300">Time: {attempt.timeTaken}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-green-500">Correct: {attempt.correctAnswers}</p>
                            <p className="text-red-500">Incorrect: {attempt.incorrectAnswers}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}