/**
 * Google OAuth — project thematic-bonus-505202-j2 (1004017212123-…).
 *
 * Source Android client (downloaded JSON):
 *   client_secret_1004017212123-5go5m596pg9d5stm1nv9vhjq0u9irt78
 *     .apps.googleusercontent.com.json
 *
 * Android matching is by package + SHA-1 on THAT OAuth client in Console
 * (Play Services does not read the JSON from the app bundle):
 *
 *   Package: com.awakeningclasses
 *   SHA-1:   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
 *
 * IMPORTANT: GoogleSignin.configure({ webClientId }) should ideally be a
 * "Web application" client in the SAME project. If DEVELOPER_ERROR persists
 * after SHA-1 is correct, create a Web client in thematic-bonus and set
 * GOOGLE_WEB_CLIENT_ID to that Web client ID (keep this Android client for
 * package/SHA-1 matching).
 */

/** Android OAuth client — from the client_secret_100401… JSON filename */
export const GOOGLE_ANDROID_CLIENT_ID =
  '1004017212123-5go5m596pg9d5stm1nv9vhjq0u9irt78.apps.googleusercontent.com';

/**
 * Client ID passed to GoogleSignin on Android as `webClientId`.
 * This MUST be a "Web application" OAuth client (not the Android OAuth client id),
 * from the same Google Cloud project as the Android OAuth client.
 */
export const GOOGLE_WEB_CLIENT_ID =
  '1004017212123-fctk4irj99760jndsdcvddu5lhr5271f.apps.googleusercontent.com';

/** iOS client — GoogleService-Info.plist (same thematic-bonus project) */
export const GOOGLE_IOS_CLIENT_ID =
  '1004017212123-c7bbgnp0abm3gm3amjcrjkedcorqv9j1.apps.googleusercontent.com';

/** @deprecated alias — same as GOOGLE_ANDROID_CLIENT_ID */
export const GOOGLE_ANDROID_DEBUG_CLIENT_ID = GOOGLE_ANDROID_CLIENT_ID;

export const GOOGLE_ANDROID_PACKAGE = 'com.awakeningclasses';

export const GOOGLE_ANDROID_DEBUG_SHA1 =
  '5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25';

export const GOOGLE_PROJECT_ID = 'thematic-bonus-505202-j2';
