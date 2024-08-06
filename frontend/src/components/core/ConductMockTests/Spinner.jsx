import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-gray-900">
    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white"></div>
  </div>
);

export default LoadingSpinner;