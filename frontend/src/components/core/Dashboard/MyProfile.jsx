import { useEffect } from "react"
import { RiEditLine, RiUserLine, RiMailLine, RiPhoneLine, RiCalendarLine, RiGenderlessFill } from "react-icons/ri"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { formattedDate } from "../../../utils/dateFormatter"
import IconBtn from "../../common/IconBtn"
import Img from './../../common/Img'

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="bg-black pb-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-8 sm:mb-12 text-center tracking-tight">
          My <span className="text-gray-400">Profile</span>
        </h1>

        <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-white opacity-5 transform -skew-x-12"></div>
          
          <div className="relative z-10 p-6 sm:p-8 md:p-12">
            <div className="flex flex-col items-center mb-8 sm:mb-12">
              <Img
                src={user?.image}
                alt={`profile-${user?.firstName}`}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white mb-4 sm:mb-6"
              />
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white capitalize mb-2">
                  {user?.firstName + " " + user?.lastName}
                </h2>
                <p className="text-gray-400 mb-4">{user?.email}</p>
              <div className="flex justify-between align-center w-full gap-4">
              <IconBtn
                  text="Edit Profile"
                  onclick={() => navigate("/dashboard/settings")}
                  className=" text-black px-4 sm:px-6 py-2 rounded-full transition duration-300 flex items-center text-sm "
                >
                  <RiEditLine className="mr-2" />
                </IconBtn>
                <IconBtn
                  text="Dashboard"
                  onclick={() => navigate("/dashboard/enrolled-courses")}
                  className=" text-black px-4 sm:px-6 py-2 rounded-full transition duration-300 flex items-center text-sm "
                >
                  <RiEditLine className="mr-2" />
                </IconBtn>
              </div>
              </div>
            </div>

            <div className="mb-8 sm:mb-12">
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">About Me</h3>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                {user?.additionalDetails?.about || "Tell us about yourself..."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <InfoCard
                icon={<RiUserLine />}
                label="Full Name"
                value={`${user?.firstName} ${user?.lastName}`}
              />
              <InfoCard
                icon={<RiMailLine />}
                label="Email"
                value={user?.email}
              />
              <InfoCard
                icon={<RiPhoneLine />}
                label="Phone"
                value={user?.additionalDetails?.contactNumber || "Add Contact Number"}
              />
              <InfoCard
                icon={<RiCalendarLine />}
                label="Date of Birth"
                value={formattedDate(user?.additionalDetails?.dateOfBirth) || "Add Date of Birth"}
              />
              <InfoCard
                icon={<RiGenderlessFill />}
                label="Gender"
                value={user?.additionalDetails?.gender || "Add Gender"}
              />
              <InfoCard
                icon={<RiUserLine />}
                label="Account Type"
                value={user?.accountType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-black border border-slate-600 rounded-xl p-4 sm:p-6 flex items-start group transition duration-300">
      <div className="text-xl sm:text-2xl text-white mr-3 sm:mr-4 group-hover:scale-110 transform transition duration-300">{icon}</div>
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">{label}</p>
        <p className="text-sm sm:text-base md:text-lg font-semibold text-white capitalize">{value}</p>
      </div>
    </div>
  )
}