import React from 'react';

const ErrorMessage = ({ message }) => (
  <div className="flex justify-center items-center h-screen bg-gray-900">
    <div className="text-center text-2xl font-bold text-white p-8 bg-gray-800 rounded-lg shadow-md max-w-md">
      {message}
    </div>
  </div>
);

export default ErrorMessage;