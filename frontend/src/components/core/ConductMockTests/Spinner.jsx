import React, { useState, useEffect } from 'react';

const LoadingSpinner = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Loading Mock Test');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress === 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 50);

    const textTimer = setInterval(() => {
      setLoadingText((prevText) => {
        if (prevText === 'Loading Mock Test...') return 'Loading Mock Test';
        return prevText + '.';
      });
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(textTimer);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black text-gray-200">
      <div className="text-4xl font-bold mb-8 animate-pulse">{loadingText}</div>
      <div className="relative w-64 h-8 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="absolute top-0 h-full bg-gradient-to-r from-white via-slate-500 to-gray-400 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <span className="text-lg font-semibold text-gray-200">{progress}%</span>
        </div>
      </div>
      <div className="mt-8 text-xl text-gray-400">Preparing your experience...</div>
      <div className="mt-4 animate-spin">
        <svg className="w-12 h-12 text-slate-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    </div>
  );
};

export default LoadingSpinner;