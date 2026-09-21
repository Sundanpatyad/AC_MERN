import { AppState, AppStateStatus, Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiConnector } from './api';
import { endpoints } from '../constants/api';
import { useAuthStore } from '../store/authStore';

const HEARTBEAT_MS = 25_000;

let currentSessionId: string | null = null;
let currentType: 'login' | 'open' | null = null;
let starting = false;
let appStateSub: { remove: () => void } | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let lastAppState: AppStateStatus = AppState.currentState;

const appVersion =
  Constants.expoConfig?.version || Constants.nativeAppVersion || '';

function newSessionId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function authHeader() {
  const token = useAuthStore.getState().token;
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}

async function postUsage(url: string, body: Record<string, unknown>) {
  const headers = authHeader();
  if (!headers) return;
  await apiConnector.post(url, body, { headers });
}

async function endCurrentSession() {
  const sessionId = currentSessionId;
  if (!sessionId) return;
  currentSessionId = null;
  currentType = null;
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  try {
    await postUsage(endpoints.USAGE_SESSION_END, { sessionId });
  } catch {
    // Offline / killed app — next start closes the dangling session server-side.
  }
}

function startHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => {
    const sessionId = currentSessionId;
    if (!sessionId || !useAuthStore.getState().token) return;
    postUsage(endpoints.USAGE_SESSION_HEARTBEAT, { sessionId }).catch(() => {});
  }, HEARTBEAT_MS);
}

async function startSession(type: 'login' | 'open') {
  if (Platform.OS === 'web') return;
  const token = useAuthStore.getState().token;
  if (!token || starting || currentSessionId) return;

  starting = true;
  const sessionId = newSessionId();
  try {
    await postUsage(endpoints.USAGE_SESSION_START, {
      sessionId,
      type,
      platform: Platform.OS,
      appVersion,
    });
    currentSessionId = sessionId;
    currentType = type;
    startHeartbeat();
  } catch {
    currentSessionId = null;
    currentType = null;
  } finally {
    starting = false;
  }
}

function onAppStateChange(next: AppStateStatus) {
  const prev = lastAppState;
  lastAppState = next;
  if (!useAuthStore.getState().token) return;

  if (next === 'active' && prev !== 'active') {
    startSession('open');
  } else if (next === 'background' && prev === 'active') {
    endCurrentSession();
  }
}

export function startAppUsageTracking(type: 'login' | 'open' = 'open') {
  if (Platform.OS === 'web') return;
  if (!useAuthStore.getState().token) return;

  if (!appStateSub) {
    lastAppState = AppState.currentState;
    appStateSub = AppState.addEventListener('change', onAppStateChange);
  }
  if (AppState.currentState === 'active') {
    startSession(type);
  }
}

export async function stopAppUsageTracking() {
  await endCurrentSession();
}

export async function resetAppUsageTracking() {
  if (appStateSub) {
    appStateSub.remove();
    appStateSub = null;
  }
  await endCurrentSession();
}
