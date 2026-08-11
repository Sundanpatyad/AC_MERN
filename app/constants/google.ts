/**
 * Google OAuth client IDs for native Google Sign-In.
 *
 * Android: the "Android" client is matched automatically by
 * package name (com.awakeningclasses) + SHA-1. Do NOT pass it as webClientId.
 * Debug SHA-1: EA:2A:7E:EB:9B:98:2C:4E:FD:93:73:88:4F:4B:A0:63:32:32:E7:6E
 */

/** Web client — required on Android/iOS to obtain tokens for the backend */
export const GOOGLE_WEB_CLIENT_ID =
  '217412143147-6l1q2l190t36rp0452f3hl5mtl3nrhjq.apps.googleusercontent.com';

/** iOS client — from GoogleService-Info.plist / CLIENT_ID */
export const GOOGLE_IOS_CLIENT_ID =
  '1004017212123-c7bbgnp0abm3gm3amjcrjkedcorqv9j1.apps.googleusercontent.com';

/**
 * Android debug client (package com.awakeningclasses + debug SHA-1).
 * Kept for reference / docs — Play Services picks this up from Google Cloud.
 */
export const GOOGLE_ANDROID_DEBUG_CLIENT_ID =
  '1004017212123-5go5m596pg9d5stm1nv9vhjq0u9irt78.apps.googleusercontent.com';

export const GOOGLE_ANDROID_PACKAGE = 'com.awakeningclasses';
