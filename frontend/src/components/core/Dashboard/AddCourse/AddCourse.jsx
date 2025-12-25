import { useEffect } from "react";
import RenderSteps from "./RenderSteps"

export default function AddCourse() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  return (
    <div className="flex w-full items-start gap-x-8">

      <div className="flex flex-1 flex-col">
        <h1 className="mb-8 text-4xl font-bold text-white text-center lg:text-left bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Create New Course
        </h1>
        <p className="mb-10 text-sm text-gray-400 text-center lg:text-left">
          Follow the steps below to create and publish your course
        </p>

        <div className="flex-1">
          <RenderSteps />
        </div>
      </div>

      {/* Course Upload Tips */}
      <div className="sticky top-10 hidden lg:block max-w-[420px] flex-1 rounded-xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-white">Course Upload Tips</p>
        </div>

        <ul className="space-y-4 text-sm text-gray-300">
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Set the Course Price option or make it free.</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>Standard size for the course thumbnail is 1024x576.</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-pink-400 mt-0.5">•</span>
            <span>Video section controls the course overview video.</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-green-400 mt-0.5">•</span>
            <span>Course Builder is where you create & organize a course.</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-yellow-400 mt-0.5">•</span>
            <span>Add Topics in the Course Builder section to create lessons, quizzes, and assignments.</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>Information from the Additional Data section shows up on the course single page.</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-red-400 mt-0.5">•</span>
            <span>Make Announcements to notify any important notes to all enrolled students at once.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}