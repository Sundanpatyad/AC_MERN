import ChangeProfilePicture from "./ChangeProfilePicture"
import DeleteAccount from "./DeleteAccount"
import EditProfile from "./EditProfile"
import UpdatePassword from "./UpdatePassword"
import NotificationPreferences from "./NotificationPreferences"

export default function Settings() {
  return (
    <>
      <h1 className="mb-14 text-3xl font-medium text-fg font-boogaloo text-center sm:text-left">
        Edit Profile
      </h1>
      {/* Change Profile Picture */}
      <ChangeProfilePicture />
      {/* Profile */}
      <EditProfile />
      {/* Password */}
      <UpdatePassword />
      {/* Notification preferences (web + sync with app) */}
      <NotificationPreferences />
      {/* Delete Account */}
      <DeleteAccount />
    </>
  )
}
