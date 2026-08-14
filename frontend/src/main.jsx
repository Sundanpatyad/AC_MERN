import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducer/index';
import { QueryClient, QueryClientProvider } from 'react-query';
import Toaster from './components/common/Toaster';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { unregisterStaleServiceWorkers } from './lib/pwa';
// Registers the axios auth interceptors before any component can issue a request.
import './services/apiConnector';

const CLIENT_ID = '217412143147-6l1q2l190t36rp0452f3hl5mtl3nrhjq.apps.googleusercontent.com';

const store = configureStore({
  reducer: rootReducer,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Provider store={store}>
        <React.StrictMode>
          <GoogleOAuthProvider clientId={CLIENT_ID}>
            <App />
          </GoogleOAuthProvider>
          <Toaster />
        </React.StrictMode>
      </Provider>
    </BrowserRouter>
  </QueryClientProvider>
);

// Keep Firebase messaging SW. Drop leftover Workbox/CRA workers that
// cache stale JS and blank the installed PWA after a deploy.
unregisterStaleServiceWorkers();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "AC_PWA_RELOAD") {
      window.location.reload();
    }
  });
}

window.addEventListener("unhandledrejection", (event) => {
  const message = String(event.reason?.message || event.reason || "");
  if (/Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk/i.test(message)) {
    if (!sessionStorage.getItem("ac-pwa-chunk-reload")) {
      sessionStorage.setItem("ac-pwa-chunk-reload", "1");
      window.location.reload();
    }
  }
});
