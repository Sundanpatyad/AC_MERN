import React from 'react';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-slate-200">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-slate-200">
          404
        </h1>
        <p className="text-2xl font-semibold mt-4 mb-8">Oops! Page Not Found</p>
        <div className="animate-bounce mb-8">
          <svg className="mx-auto h-16 w-16 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-slate-200 text-black font-semibold rounded-full hover:bg-gray-200 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;