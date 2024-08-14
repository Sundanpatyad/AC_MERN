import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { updateProfile } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../common/IconBtn"

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"]

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const submitProfileForm = async (data) => {
    try {
      dispatch(updateProfile(token, data))
    } catch (error) {
      // //console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <div className="bg-black rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 md:p-10">
      <h2 className="text-3xl font-bold text-white mb-8">Edit Profile</h2>
      <form onSubmit={handleSubmit(submitProfileForm)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="First Name"
            name="firstName"
            register={register}
            errors={errors}
            defaultValue={user?.firstName}
          />
          <InputField
            label="Last Name"
            name="lastName"
            register={register}
            errors={errors}
            defaultValue={user?.lastName}
          />
          <InputField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            register={register}
            errors={errors}
            defaultValue={user?.additionalDetails?.dateOfBirth}
            validation={{
              required: "Please enter your Date of Birth.",
              max: {
                value: new Date().toISOString().split("T")[0],
                message: "Date of Birth cannot be in the future.",
              },
            }}
          />
          <SelectField
            label="Gender"
            name="gender"
            options={genders}
            register={register}
            errors={errors}
            defaultValue={user?.additionalDetails?.gender}
          />
          <InputField
            label="Contact Number"
            name="contactNumber"
            type="tel"
            register={register}
            errors={errors}
            defaultValue={user?.additionalDetails?.contactNumber}
            validation={{
              required: "Please enter your Contact Number.",
              maxLength: { value: 12, message: "Invalid Contact Number" },
              minLength: { value: 10, message: "Invalid Contact Number" },
            }}
          />
          <InputField
            label="About"
            name="about"
            register={register}
            errors={errors}
            defaultValue={user?.additionalDetails?.about}
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => navigate("/dashboard/my-profile")}
            className="px-6 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors duration-300"
          >
            Cancel
          </button>
          <IconBtn
            type="submit"
            text="Save Changes"
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
          />
        </div>
      </form>
    </div>
  )
}

function InputField({ label, name, type = "text", register, errors, defaultValue, validation = { required: true } }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={name}
        {...register(name, validation)}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">
          {errors[name].message || `Please enter your ${label.toLowerCase()}.`}
        </p>
      )}
    </div>
  )
}

function SelectField({ label, name, options, register, errors, defaultValue }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <select
        id={name}
        {...register(name, { required: true })}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">
          Please select your {label.toLowerCase()}.
        </p>
      )}
    </div>
  )
}