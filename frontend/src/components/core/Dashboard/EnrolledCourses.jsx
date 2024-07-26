import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getUserEnrolledCourses, getUserAttempts, getUserEnrolledMockTests } from "../../../services/operations/profileAPI"
import Img from './../../common/Img';

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [enrolledCourses, setEnrolledCourses] = useState(null)
  const [mockAttempts, setMockAttempts] = useState(null)
  const [showMockAttempts, setShowMockAttempts] = useState(false)
  const [enrolledMockTests, setEnrolledMockTests] = useState(null)

  const getEnrolledCourses = async () => {
    try {
      const res = await getUserEnrolledCourses(token);
      setEnrolledCourses(res);
    } catch (error) {
      console.log("Could not fetch enrolled courses.")
    }
  };

  const getMockAttempts = async () => {
    try {
      const res = await getUserAttempts(token);
      setMockAttempts(res.attempts);
      console.log(res);
    } catch (error) {
      console.log("Could not fetch mock test attempts.")
    }
  };

  const getEnrolledMockTests = async () => {
    try {
      const res = await getUserEnrolledMockTests(token);
      setEnrolledMockTests(res);
    } catch (error) {
      console.log("Could not fetch enrolled mock tests.")
    }
  };

  useEffect(() => {
    getEnrolledCourses();
    getEnrolledMockTests();
  }, [])

  const sklItem = () => {
    return (
      <div className="flex border border-richblack-700 px-5 py-3 w-full">
        <div className="flex flex-1 gap-x-4 ">
          <div className='h-14 w-14 rounded-lg skeleton '></div>
          <div className="flex flex-col w-[40%] ">
            <p className="h-2 w-[50%] rounded-xl  skeleton"></p>
            <p className="h-2 w-[70%] rounded-xl mt-3 skeleton"></p>
          </div>
        </div>
        <div className="flex flex-[0.4] flex-col ">
          <p className="h-2 w-[20%] rounded-xl skeleton mt-2"></p>
          <p className="h-2 w-[40%] rounded-xl skeleton mt-3"></p>
        </div>
      </div>
    )
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
    <div className="min-h-screen bg-gradient-to-b from-richblack-900 to-richblack-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-600 font-extrabold text-center mb-12">
          Your Learning Journey
        </h1>

        {/* Enrolled Courses Section */}
        <section className="mb-16">
          <h2 className="text-4xl text-richblack-5 font-bold mb-8">Enrolled Courses</h2>
          <div className="bg-richblack-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-3 bg-richblack-700 py-4 px-6">
              <p className="text-richblack-50 font-semibold">Course Name</p>
              <p className="text-richblack-50 font-semibold">Duration</p>
              <p className="text-richblack-50 font-semibold">Progress</p>
            </div>
            {!enrolledCourses ? (
              <div className="p-4">{sklItem()}{sklItem()}{sklItem()}</div>
            ) : enrolledCourses.length === 0 ? (
              <p className="text-center text-richblack-300 py-8">You haven't enrolled in any courses yet.</p>
            ) : (
              enrolledCourses.map((course, i) => (
                <div key={i} className="grid grid-cols-3 items-center py-6 px-6 border-b border-richblack-700 hover:bg-richblack-700 transition-all duration-200">
                  <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate(`/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`)}>
                    <Img src={course.thumbnail} alt="course_img" className="h-16 w-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-richblack-5">{course.courseName}</p>
                      <p className="text-sm text-richblack-300 mt-1">{course.courseDescription.slice(0, 50)}...</p>
                    </div>
                  </div>
                  <p className="text-richblack-300">{course?.totalDuration}</p>
                  <div className="w-full max-w-xs">
                    <p className="text-sm text-richblack-300 mb-2">Progress: {course.progressPercentage || 0}%</p>
                    <ProgressBar completed={course.progressPercentage || 0} height="8px" isLabelVisible={false} bgColor="#60A5FA" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Enrolled Mock Tests Section */}
        <section className="mb-16">
          <h2 className="text-4xl text-richblack-5 font-bold mb-8">Enrolled Mock Tests</h2>
          <div className="bg-richblack-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-3 bg-richblack-700 py-4 px-6">
              <p className="text-richblack-50 font-semibold">Mock Test Name</p>
              <p className="text-richblack-50 font-semibold">Price</p>
              <p className="text-richblack-50 font-semibold">Status</p>
            </div>
            {!enrolledMockTests ? (
              <div className="p-4">{sklItem()}{sklItem()}{sklItem()}</div>
            ) : enrolledMockTests.length === 0 ? (
              <p className="text-center text-richblack-300 py-8">You haven't enrolled in any mock tests yet.</p>
            ) : (
              enrolledMockTests.map((mockTest, i) => (
                <div key={i} className="grid grid-cols-3 items-center py-6 px-6 border-b border-richblack-700 hover:bg-richblack-700 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <Img src={mockTest.thumbnail} alt="mock_test_img" className="h-16 w-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-white">{mockTest.testName}</p>
                      <p className="text-sm text-richblack-300 mt-1">{mockTest.description.slice(0, 50)}...</p>
                    </div>
                  </div>
                  <p className="text-richblack-300">Rs.{mockTest.price}</p>
                  <p className={`text-sm font-medium ${mockTest.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {mockTest.status === 'draft' ? 'draft' : 'Published'}
                  </p>
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
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            {showMockAttempts ? "Hide Mock Test Attempts" : "Show Mock Test Attempts"}
          </button>

          {showMockAttempts && (
            <div className="mt-12">
              <h2 className="text-4xl text-richblack-5 font-bold mb-8">Mock Test Attempts</h2>
              {!mockAttempts ? (
                <div className="bg-richblack-800 rounded-2xl p-4 shadow-lg">
                  {sklItem()}{sklItem()}{sklItem()}
                </div>
              ) : mockAttempts.length === 0 ? (
                <p className="text-center text-richblack-300 py-8">You haven't attempted any mock tests yet.</p>
              ) : (
                Object.entries(groupAttemptsBySeriesName(mockAttempts)).map(([seriesName, attempts]) => (
                  <div key={seriesName} className="mt-8 bg-richblack-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-2xl text-richblack-5 font-semibold mb-4">{seriesName}</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {attempts.map((attempt, index) => (
                        <div key={index} className="bg-richblack-700 rounded-lg p-4 hover:bg-richblack-600 transition-all duration-200">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-richblack-5 font-semibold">{attempt.testName}</p>
                            <p className="text-richblack-300 text-sm">{new Date(attempt.createdAt).toLocaleDateString()}</p>
                          </div>
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