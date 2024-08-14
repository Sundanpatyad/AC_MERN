import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../../../services/operations/SettingsAPI";
import IconBtn from "../../../common/IconBtn";

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitPasswordForm = async (data) => {
    try {
      await changePassword(token, data);
    } catch (error) {
      // //console.log("ERROR MESSAGE - ", error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitPasswordForm)} className="max-w-md mx-auto">
      <div className="my-10 rounded-lg bg-black p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Update Password</h2>
        <div className="space-y-6">
          {["oldPassword", "newPassword", "confirmNewPassword"].map((field) => (
            <div key={field} className="relative">
              <label htmlFor={field} className="block text-sm font-medium text-gray-300 mb-1">
                {field === "oldPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password"}
              </label>
              <input
                type={field === "oldPassword" ? (showOldPassword ? "text" : "password") :
                      field === "newPassword" ? (showNewPassword ? "text" : "password") :
                      (showConfirmNewPassword ? "text" : "password")}
                id={field}
                {...register(field, { required: true })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${field === "oldPassword" ? "Current" : field === "newPassword" ? "New" : "Confirm New"} Password`}
              />
              <button
                type="button"
                onClick={() => {
                  if (field === "oldPassword") setShowOldPassword(prev => !prev);
                  if (field === "newPassword") setShowNewPassword(prev => !prev);
                  if (field === "confirmNewPassword") setShowConfirmNewPassword(prev => !prev);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer"
              >
                {(field === "oldPassword" && showOldPassword) ||
                 (field === "newPassword" && showNewPassword) ||
                 (field === "confirmNewPassword" && showConfirmNewPassword) ? (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                ) : (
                  <AiOutlineEye className="h-5 w-5" />
                )}
              </button>
              {errors[field] && (
                <p className="mt-1 text-sm text-red-500">
                  Please enter your {field === "oldPassword" ? "Current" : field === "newPassword" ? "New" : "Confirm New"} Password.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={() => navigate("/dashboard/my-profile")}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <IconBtn type="submit" text="Update" />
      </div>
    </form>
  );
}