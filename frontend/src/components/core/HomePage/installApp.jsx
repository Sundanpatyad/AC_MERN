import React, { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import rzpLogo from '../../../assets/Logo/rzp_logo.png';


const InstallApp = ({ handleInstall }) => {
  const [isVisible, setIsVisible] = useState(true);
  const token = useSelector((state) => state.auth.token);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 50000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className={`fixed z-40 ${token ? 'bottom-16 ' : 'bottom-0'}  left-0 right-0 mx-auto p-4 sm:p-0 sm:bottom-6 sm:left-6 sm:right-6 max-w-sm`}
        >
          <div className="bg-black rounded-xl shadow-lg overflow-hidden border border-gray-800">
            <div className="relative p-4 sm:p-6">
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 bg-gray-800 p-3 rounded-full">
                  <img
                    src={rzpLogo}
                    alt="App Logo"
                    className="w-6 h-6 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">Get Our App</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Experience the full power of our platform
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleInstall}
                  className="w-full bg-slate-200 text-zinc-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center justify-center space-x-2 group"
                >
                  <span>Install Now</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallApp;