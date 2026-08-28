package expo.modules.androidnavmode

import android.content.Context
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AndroidNavModeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AndroidNavMode")

    Function("getNavigationMode") {
      resolveNavMode()
    }
  }

  private fun resolveNavMode(): String {
    val context = appContext.reactContext
      ?: appContext.currentActivity
      ?: return "unknown"

    return when (readNavMode(context)) {
      0 -> "buttons"
      1 -> "twoButton"
      2 -> "gesture"
      else -> "unknown"
    }
  }

  /**
   * Android 10+: Settings.Secure.navigation_mode
   *   0 = 3-button, 1 = 2-button, 2 = gesture
   * OEM fallback: config_navBarInteractionMode (same values).
   */
  private fun readNavMode(context: Context): Int {
    if (Build.VERSION.SDK_INT >= 29) {
      val fromSettings = try {
        Settings.Secure.getInt(context.contentResolver, "navigation_mode", -1)
      } catch (_: Exception) {
        -1
      }
      if (fromSettings >= 0) return fromSettings
    }

    val resId = context.resources.getIdentifier(
      "config_navBarInteractionMode",
      "integer",
      "android"
    )
    if (resId > 0) {
      return try {
        context.resources.getInteger(resId)
      } catch (_: Exception) {
        -1
      }
    }

    // Pre-gesture Android used 3-button navigation.
    return if (Build.VERSION.SDK_INT < 29) 0 else -1
  }
}
