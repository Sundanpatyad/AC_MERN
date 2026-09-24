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
 *   Debug SHA-1 (android/app/debug.keystore):
 *     5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
 *   Release / upload SHA-1 (android/app/awakening-release.keystore):
 *     EB:FB:E0:82:D9:3D:D1:95:2E:0F:8D:1A:1C:A0:53:A4:B9:A9:22:A3
 *
 * Play Store installs are signed with deployment_cert.der (not the
 * Classical / post-quantum buttons):
 *   SHA-1: 53:95:DD:5E:A6:BE:60:F6:A6:56:D1:C5:82:43:7F:90:69:AE:EF:74
 *
 * IMPORTANT: GoogleSignin.configure({ webClientId }) must be a
 * "Web application" client in the SAME project as the Android client.
 */

/** Android OAuth client — project project-dda2123f-6feb-4d3c-bb4 (same project as iOS). */
export const GOOGLE_ANDROID_CLIENT_ID =
  '279937570516-9fvnpqcnvkbthqcbnramnpvv5qsqc2au.apps.googleusercontent.com';

/**
 * Passed to GoogleSignin on Android as `webClientId`.
 * Same client as GOOGLE_ANDROID_CLIENT_ID so the audience matches the iOS project.
 */
export const GOOGLE_WEB_CLIENT_ID = GOOGLE_ANDROID_CLIENT_ID;

/** iOS OAuth client from the downloaded Google plist. */
export const GOOGLE_IOS_CLIENT_ID =
  '279937570516-lun1lu6ie0ikg9ni0lb3qh6o4bjlhrl1.apps.googleusercontent.com';

/** @deprecated alias — same as GOOGLE_ANDROID_CLIENT_ID */
export const GOOGLE_ANDROID_DEBUG_CLIENT_ID = GOOGLE_ANDROID_CLIENT_ID;

export const GOOGLE_ANDROID_PACKAGE = 'com.awakeningclasses';

export const GOOGLE_ANDROID_DEBUG_SHA1 =
  '5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25';

/** Upload key. Play installs use the App signing certificate instead. */
export const GOOGLE_ANDROID_RELEASE_SHA1 =
  'EB:FB:E0:82:D9:3D:D1:95:2E:0F:8D:1A:1C:A0:53:A4:B9:A9:22:A3';

/** Play deployment certificate. This is what signs installs from Play. */
export const GOOGLE_ANDROID_PLAY_SHA1 =
  '53:95:DD:5E:A6:BE:60:F6:A6:56:D1:C5:82:43:7F:90:69:AE:EF:74';

export const GOOGLE_PROJECT_ID = 'thematic-bonus-505202-j2';
