import { apiConnector } from './api';
import { endpoints } from '../constants/api';
import { useAuthStore } from '../store/authStore';

export async function loginWithPassword(email: string, password: string) {
  const response = await apiConnector.post(endpoints.LOGIN_API, {
    email: email.trim().toLowerCase(),
    password,
  });

  if (!response.data?.success) {
    return {
      success: false,
      message: response.data?.message || 'Login failed',
    };
  }

  const { token, user } = response.data;
  const userImage = user?.image
    ? user.image
    : `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`;

  const authStore = useAuthStore.getState();
  await authStore.setToken(token);
  await authStore.setUser({ ...user, image: userImage });

  try {
    const { enablePushNotifications } = await import('./pushNotifications');
    await enablePushNotifications();
  } catch {
    // Push may be unavailable until a native rebuild
  }

  return { success: true as const };
}
