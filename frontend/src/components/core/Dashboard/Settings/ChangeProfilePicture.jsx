import { useEffect, useRef, useState } from "react"
import { FiUpload } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { updateUserProfileImage } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../common/IconBtn"
import Img from './../../../common/Img'

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [previewSource, setPreviewSource] = useState(null)

  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      previewFile(file)
    }
  }

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  const handleFileUpload = () => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("profileImage", profileImage)

      dispatch(updateUserProfileImage(token, formData)).then(() => {
        setLoading(false)
      })
    } catch (error) {
      // //console.log("ERROR MESSAGE - ", error.message)
    }
  }

  useEffect(() => {
    if (profileImage) {
      previewFile(profileImage)
    }
  }, [profileImage])

  return (
    <div className="bg-black rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 md:p-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Change Profile Picture</h2>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <Img
            src={previewSource || user?.image}
            alt={`profile-${user?.firstName}`}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleClick}
              className="text-white text-sm font-semibold bg-transparent border border-white rounded-full py-1 px-3 hover:bg-white hover:text-black transition-colors duration-300"
            >
              Change
            </button>
          </div>
        </div>
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-gray-300 text-sm sm:text-base">
            Upload a new profile picture. <br />
            Image should be in PNG, JPG, or GIF format.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/gif, image/jpeg, image/jpg"
            />
            <button
              onClick={handleClick}
              disabled={loading}
              className="bg-white text-black px-6 py-2 rounded-full transition duration-300 hover:bg-gray-200 text-sm sm:text-base font-semibold"
            >
              Select File
            </button>
           {
            previewFile && (
              <IconBtn
              text={loading ? "Uploading..." : "Upload"}
              onclick={handleFileUpload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition duration-300 flex items-center justify-center text-sm sm:text-base"
            >
              {!loading && (
                <FiUpload className="mr-2" />
              )}
            </IconBtn>
            )
           }
          </div>
        </div>
      </div>
    </div>
  )
}