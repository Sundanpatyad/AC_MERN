/**
 * Google Analytics 4 (gtag) for the Vite SPA.
 * Set VITE_GA_MEASUREMENT_ID in .env (falls back to Firebase measurement ID).
 */

const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID ||
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
  'G-QLLN9DC2JK';

let initialized = false;

export function getGaMeasurementId() {
  return GA_MEASUREMENT_ID;
}

/** Load gtag.js once. Safe to call repeatedly. */
export function initGoogleAnalytics() {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || initialized) {
    return;
  }

  initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  // SPA: disable auto page_view; we send on route changes
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/** Track a client-side navigation. */
export function trackPageView(path, title = document.title) {
  if (typeof window === 'undefined' || !window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}

/** Custom event helper, e.g. trackEvent('purchase', { value: 499 }). */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag('event', eventName, params);
}

/** Optional: tie analytics sessions to a logged-in user. */
export function setAnalyticsUserId(userId) {
  if (typeof window === 'undefined' || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag('config', GA_MEASUREMENT_ID, {
    user_id: userId ? String(userId) : undefined,
  });
}
