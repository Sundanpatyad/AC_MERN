// src/serviceWorkerRegistration.js

// Check if service workers are supported
const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(\.\d{1,3}){3}$/)
  );
  
  // Function to register the service worker
  export function register(config) {
    if ('serviceWorker' in navigator) {
      // Set the URL of the service worker script
      const swUrl = `https://awakeningclasses.vercel.app/service-worker.js`;
  
      if (isLocalhost) {
        // If running on localhost, check for a valid service worker
        checkValidServiceWorker(swUrl, config);
      } else {
        // Register the service worker for production or non-localhost environments
        registerValidSW(swUrl, config);
      }
    }
  }
  
  // Function to register a valid service worker
  function registerValidSW(swUrl, config) {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('ServiceWorker registration successful:', registration);
  
        if (config && config.onUpdate) {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available; prompt user to refresh
                  console.log('New content is available; please refresh.');
                  if (config.onUpdate) {
                    config.onUpdate(registration);
                  }
                } else {
                  // Content is cached for offline use
                  console.log('Content is cached for offline use.');
                  if (config.onSuccess) {
                    config.onSuccess(registration);
                  }
                }
              }
            };
          };
        }
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed:', error);
      });
  }
  
  // Function to check if the service worker is valid
  function checkValidServiceWorker(swUrl, config) {
    fetch(swUrl)
      .then((response) => {
        const contentType = response.headers.get('content-type');
        if (
          response.status === 404 ||
          (contentType != null && contentType.indexOf('javascript') === -1)
        ) {
          // Service worker file not found or not valid, unregister and reload
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          });
        } else {
          // Register the valid service worker
          registerValidSW(swUrl, config);
        }
      })
      .catch(() => {
        console.log(
          'No internet connection found. App is running in offline mode.'
        );
      });
  }
  
  // Function to unregister the service worker
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.unregister();
        })
        .catch((error) => {
          console.error('Error unregistering service worker:', error.message);
        });
    }
  }
  