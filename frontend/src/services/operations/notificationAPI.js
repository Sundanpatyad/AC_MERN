import { toast } from "@/utils/toast"
import { apiConnector } from "../apiConnector"
import { notificationEndpoints } from "../apis"


/**
 * Send a push notification to all users with FCM tokens, or to one user by email.
 * @param {{ title: string, body: string, broadcast?: boolean, email?: string, category?: string }} payload
 * @param {string} token
 */
export const sendPushNotification = async (payload, token) => {
  const toastId = toast.loading("Sending...")
  try {
    const response = await apiConnector(
      "POST",
      notificationEndpoints.SEND_NOTIFICATION,
      payload,
      { Authorization: `Bearer ${token}` }
    )

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Couldn't send")
    }

    const {
      successCount = 0,
      failureCount = 0,
      message,
    } = response.data

    if (successCount === 0 && failureCount === 0) {
      toast.success(message || "No devices to notify")
    } else {
      toast.success(`Sent to ${successCount}`)
    }

    return response.data
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Couldn't send"
    toast.error(msg)
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
      throw new Error(response?.data?.message || "Couldn't save")
    }
    return response.data.data
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Couldn't save"
    toast.error(msg)
    return null
  }
}
