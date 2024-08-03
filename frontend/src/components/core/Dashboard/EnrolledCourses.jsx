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
    <div className="min-h-screen bg-black text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
          Your Learning Dashboard
        </h1>

        {/* Enrolled Courses Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-100">Enrolled Courses</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading.courses ? (
              <p className="col-span-full text-center text-gray-400 py-8">Loading enrolled courses...</p>
            ) : error.courses ? (
              <p className="col-span-full text-center text-red-500 py-8">Error: {error.courses}</p>
            ) : !enrolledCourses || enrolledCourses.length === 0 ? (
              <p className="col-span-full text-center text-gray-400 py-8">You haven't enrolled in any courses yet.</p>
            ) : (
              enrolledCourses.map((course, i) => (
                <div key={i} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="p-6 cursor-pointer" onClick={() => navigate(`/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`)}>
                    <Img src={course.thumbnail} alt="course_img" className="h-48 w-full rounded-lg object-cover mb-4" />
                    <h3 className="font-bold text-xl mb-2 text-gray-100">{course.courseName}</h3>
                    <p className="text-gray-400 mb-4">{course.courseDescription.slice(0, 100)}...</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Duration: {course?.totalDuration}</span>
                      <span className="text-sm font-semibold text-blue-400">Progress: {course.progressPercentage || 0}%</span>
                    </div>
                    <ProgressBar completed={course.progressPercentage || 0} height="8px" isLabelVisible={false} bgColor="#60A5FA" baseBgColor="#4B5563" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Enrolled Mock Tests Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-100">Enrolled Mock Tests</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading.mockTests ? (
              <p className="col-span-full text-center text-gray-400 py-8">Loading enrolled mock tests...</p>
            ) : error.mockTests ? (
              <p className="col-span-full text-center text-red-500 py-8">Error: {error.mockTests}</p>
            ) : !enrolledMockTests || enrolledMockTests.length === 0 ? (
              <p className="col-span-full text-center text-gray-400 py-8">You haven't enrolled in any mock tests yet.</p>
            ) : (
              enrolledMockTests.map((mockTest, i) => (
                <div
                onClick={() => navigate(`/mock-test/${mockTest._id}`)}
                key={i} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="p-6">
                    <Img src={mockTest.thumbnail} alt="mock_test_img" className="h-48 w-full rounded-lg object-cover mb-4" />
                    <h3 className="font-bold text-xl mb-2 text-gray-100">{mockTest.testName}</h3>
                    <p className="text-gray-400 mb-4">{mockTest.description.slice(0, 100)}...</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-green-400">Rs. {mockTest.price}</span>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${mockTest.status === 'completed' ? 'bg-green-500 text-green-100' : 'bg-yellow-500 text-yellow-100'}`}>
                        {mockTest.status === 'draft' ? 'Draft' : 'Published'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Mock Test Attempts Section */}
        <section className="text-center mb-16">
          <button
            onClick={() => {
              setShowMockAttempts(!showMockAttempts)
              if (!mockAttempts) getMockAttempts()
            }}
            className="bg-gradient-to-r from-slate-400 to-white text-black font-bold py-3 px-8 rounded-full hover:from-slate-400 hover:to-white transition-all duration-300 shadow-lg text-lg"
          >
            {showMockAttempts ? "Hide Mock Test Attempts" : "Show Mock Test Attempts"}
          </button>
          

          {showMockAttempts && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-6 text-gray-100">Mock Test Attempts</h2>
              {loading.attempts ? (
                <p className="text-center text-gray-400 py-8">Loading mock test attempts...</p>
              ) : error.attempts ? (
                <p className="text-center text-red-500 py-8">Error: {error.attempts}</p>
              ) : !mockAttempts || mockAttempts.length === 0 ? (
                <p className="text-center text-gray-400 py-8">You haven't attempted any mock tests yet.</p>
              ) : (
                Object.entries(groupAttemptsBySeriesName(mockAttempts)).map(([seriesName, attempts]) => (
                  <div key={seriesName} className="mt-8 bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-2xl text-gray-100 font-semibold mb-4">{seriesName}</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {attempts.map((attempt, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-all duration-300">
                          <h4 className="text-lg text-gray-100 font-semibold mb-2">{attempt.testName}</h4>
                          <p className="text-gray-400 text-sm mb-3">{new Date(attempt.createdAt).toLocaleDateString()}</p>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-blue-400 font-medium">Score: {attempt.score} / {attempt.totalQuestions}</span>
                            <span className="text-purple-400 font-medium">Time: {attempt.timeTaken}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-400">Correct: {attempt.correctAnswers}</span>
                            <span className="text-red-400">Incorrect: {attempt.incorrectAnswers}</span>
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