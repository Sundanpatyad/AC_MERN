import React from "react"
import { FaCheck } from "react-icons/fa"
import { useSelector } from "react-redux"

import CourseBuilderForm from "./CourseBuilder/CourseBuilderForm"
import CourseInformationForm from "./CourseInformation/CourseInformationForm"
import PublishCourse from "./PublishCourse"
import EditCourse from './../EditCourse/EditCourse';

export default function RenderSteps() {

  const { step } = useSelector((state) => state.course)
  const { editCourse } = useSelector(state => state.course)

  const steps = [
    {
      id: 1,
      title: "Course Information",
    },
    {
      id: 2,
      title: "Course Builder",
    },
    {
      id: 3,
      title: "Publish",
    },
  ]

  return (
    <>
      <div className="relative mb-4 flex w-full select-none justify-center">
        {steps.map((item) => (
          <React.Fragment key={item.id}>
            <div className="flex flex-col items-center">
              <div
                className={`grid aspect-square w-[50px] place-items-center rounded-full border-2 font-bold text-lg transition-all duration-300 transform
                    ${step === item.id
                    ? "border-blue-400 bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50 scale-110"
                    : step > item.id
                      ? "border-green-400 bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50"
                      : "border-zinc-600 bg-zinc-800 text-zinc-400"
                  }`}
              >
                {step > item.id ? (
                  <FaCheck className="font-bold text-white animate-pulse" />
                ) : (
                  item.id
                )}
              </div>
            </div>

            {/* Progress line with gradient */}
            {item.id !== steps.length && (
              <div className="h-[25px] w-[33%] flex items-center">
                <div className={`h-1 w-full rounded-full transition-all duration-500 ${step > item.id
                    ? "bg-gradient-to-r from-green-400 to-emerald-400 shadow-md shadow-green-400/50"
                    : "bg-zinc-700"
                  }`}>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="relative mb-12 flex w-full select-none justify-between px-2">
        {steps.map((item) => (
          <div
            className={`sm:min-w-[130px] flex flex-col items-center gap-y-2 ${editCourse && 'sm:min-w-[270px]'}`}
            key={item.id}
          >
            <p className={`text-sm font-medium transition-all duration-300 ${step >= item.id
                ? "text-white font-semibold"
                : "text-zinc-500"
              }`}>
              {item.title}
            </p>
            {step === item.id && (
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
            )}
          </div>
        ))}
      </div>

      {/* Render specific component based on current step */}
      {step === 1 && <CourseInformationForm />}
      {step === 2 && <CourseBuilderForm />}
      {step === 3 && <PublishCourse />}
    </>
  )
}