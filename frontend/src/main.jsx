import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './reducer/index';
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'


const CLIENT_ID = '217412143147-6l1q2l190t36rp0452f3hl5mtl3nrhjq.apps.googleusercontent.com';


const store = configureStore({
  reducer: rootReducer
});
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <Provider store={store}>
      <React.StrictMode>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <App/>
        </GoogleOAuthProvider>
        <Toaster position="bottom-center" />
      </React.StrictMode>
    </Provider>
  </BrowserRouter>
  </QueryClientProvider>
)
