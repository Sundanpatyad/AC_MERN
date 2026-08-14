export function isStandalonePwa() {
  if (typeof window === "undefined") return false;

  const displayStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches;

  const iosStandalone = window.navigator.standalone === true;
  const androidTwa = String(document.referrer || "").startsWith("android-app://");

  return displayStandalone || iosStandalone || androidTwa;
}

export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|Line\/|Twitter|WhatsApp|Snapchat|LinkedInApp|Pinterest|MicroMessenger|TikTok|BytedanceWebview/i.test(
    ua
  );
}

export function isNativeWebView() {
  if (typeof window === "undefined") return false;
  return Boolean(window.Capacitor?.isNativePlatform?.());
}

export function shouldHandoffPaymentToBrowser() {
  return isStandalonePwa() || isInAppBrowser() || isNativeWebView();
}

export function openInSystemBrowser(url) {
  if (typeof window === "undefined") return;

  const ua = navigator.userAgent || "";
  if (/Android/i.test(ua)) {
    const withoutScheme = url.replace(/^https:\/\//i, "");
    window.location.href =
      `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;` +
      `S.browser_fallback_url=${encodeURIComponent(url)};end`;
    return;
  }

  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.href = url;
  }
}

export async function unregisterStaleServiceWorkers() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  const MIGRATE_KEY = "ac-pwa-migrate-v3";

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const stale = registrations.filter((registration) => {
      const scope = registration.scope || "";
      const scriptURL =
        registration.active?.scriptURL ||
        registration.waiting?.scriptURL ||
        registration.installing?.scriptURL ||
        "";
      return !(
        scope.includes("firebase-cloud-messaging-push-scope") ||
        scriptURL.includes("firebase-messaging-sw.js")
      );
    });

    if (!stale.length) return;

    await Promise.all(stale.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    if (!sessionStorage.getItem(MIGRATE_KEY)) {
      sessionStorage.setItem(MIGRATE_KEY, "1");
      window.location.reload();
    }
  } catch (error) {
    console.warn("[PWA] Failed to unregister stale service workers:", error);
  }
}
