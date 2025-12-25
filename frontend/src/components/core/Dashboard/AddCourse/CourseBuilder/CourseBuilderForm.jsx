import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdNavigateNext } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import { createSection, updateSection } from "../../../../../services/operations/courseDetailsAPI";
import { setCourse, setEditCourse, setStep } from "../../../../../slices/courseSlice";

import IconBtn from "../../../../common/IconBtn";
import NestedView from "./NestedView";

export default function CourseBuilderForm() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [editSectionName, setEditSectionName] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);

    let result;
    try {
      if (editSectionName) {
        result = await updateSection({ sectionName: data.sectionName, sectionId: editSectionName, courseId: course._id }, token);
      } else {
        result = await createSection({ sectionName: data.sectionName, courseId: course._id }, token);
      }

      if (result) {
        dispatch(setCourse(result));
        setEditSectionName(null);
        setValue("sectionName", "");
      }
    } catch (error) {
      toast.error("Error creating/updating section");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditSectionName(null);
    setValue("sectionName", "");
  };

  const handleChangeEditSectionName = (sectionId, sectionName) => {
    if (editSectionName === sectionId) {
      cancelEdit();
      return;
    }
    setEditSectionName(sectionId);
    setValue("sectionName", sectionName);
  };

  const goToNext = () => {
    if (course.courseContent.length === 0) {
      toast.error("Please add at least one section");
      return;
    }
    //console.log("Moving to next step");
    dispatch(setStep(3));
  };

  const goBack = () => {
    dispatch(setStep(1));
    dispatch(setEditCourse(true));
  };

  return (
    <div className="space-y-8 rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 shadow-2xl">
      <p className="text-2xl font-bold text-white">Course Builder</p>

      {/* Section Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Section Name */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-200" htmlFor="sectionName">
            Section Name <sup className="text-pink-400">*</sup>
          </label>
          <input
            id="sectionName"
            disabled={loading}
            placeholder="Add a section to build your course"
            {...register("sectionName", { required: true })}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
          />
          {errors.sectionName && (
            <span className="ml-2 text-xs tracking-wide text-pink-400 flex items-center gap-1">
              <span>⚠</span> Section name is required
            </span>
          )}
        </div>

        {/* Edit Section Name OR Create Section */}
        <div className="flex items-end gap-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-x-2 rounded-lg px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            <IoAddCircleOutline size={20} />
            {editSectionName ? "Edit Section Name" : "Create Section"}
          </button>
          {editSectionName && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-gray-400 hover:text-white underline transition-colors duration-200"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {course.courseContent?.length > 0 && (
        <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
      )}

      {/* Next and Back Button */}
      <div className="flex justify-end gap-x-3 pt-4 border-t border-zinc-700/50">
        <button
          onClick={goBack}
          className="flex items-center gap-x-2 rounded-lg px-6 py-3 font-semibold text-white bg-zinc-700 hover:bg-zinc-600 transition-all duration-200"
        >
          Back
        </button>
        <button
          disabled={loading}
          onClick={goToNext}
          className="flex items-center gap-x-2 rounded-lg px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          Next
          <MdNavigateNext className="text-xl" />
        </button>
      </div>
    </div>
  );
}