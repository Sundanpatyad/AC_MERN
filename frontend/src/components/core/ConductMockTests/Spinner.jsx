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
        if (prevText === 'Loading...') return 'Loading';
        return prevText + '.';
      });
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(textTimer);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black text-white">
      <div className="text-2xl mb-2">{loadingText}</div>
      <div className="w-64 h-6 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-white"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-2">{progress}%</div>
    </div>
  );
};

export default LoadingSpinner;