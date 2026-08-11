import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { notificationEndpoints } from "../apis"

const toastOptions = {
  style: {
    borderRadius: "10px",
    background: "#333",
    color: "#fff",
  },
}

/**
 * Send a push notification to all users with FCM tokens, or to one user by email.
 * @param {{ title: string, body: string, broadcast?: boolean, email?: string, category?: string }} payload
 * @param {string} token
 */
export const sendPushNotification = async (payload, token) => {
  const toastId = toast.loading("Sending notification...", toastOptions)
  try {
    const response = await apiConnector(
      "POST",
      notificationEndpoints.SEND_NOTIFICATION,
      payload,
      { Authorization: `Bearer ${token}` }
    )

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to send notification")
    }

    const {
      successCount = 0,
      failureCount = 0,
      skippedByPrefs = 0,
      message,
    } = response.data

    if (successCount === 0 && failureCount === 0) {
      toast.success(
        message ||
          (skippedByPrefs
            ? `No eligible devices (${skippedByPrefs} skipped by prefs)`
            : "No devices to notify"),
        toastOptions
      )
    } else {
      toast.success(
        `Sent to ${successCount} device(s)${failureCount ? `, ${failureCount} failed` : ""}${
          skippedByPrefs ? `, ${skippedByPrefs} skipped by prefs` : ""
        }`,
        toastOptions
      )
    }

    return response.data
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send notification"
    toast.error(msg, toastOptions)
    return null
  } finally {
    toast.dismiss(toastId)
  }
}

export const fetchNotificationPrefs = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      notificationEndpoints.GET_PREFS,
      null,
      { Authorization: `Bearer ${token}` }
    )
    return response?.data?.data || null
  } catch (error) {
    console.warn("[prefs] fetch failed", error?.message || error)
    return null
  }
}

export const saveNotificationPrefs = async (prefs, token) => {
  try {
    const response = await apiConnector(
      "PUT",
      notificationEndpoints.UPDATE_PREFS,
      prefs,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to save preferences")
    }
    return response.data.data
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to save preferences"
    toast.error(msg, toastOptions)
    return null
  }
}
