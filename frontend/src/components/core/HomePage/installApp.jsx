import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import rzpLogo from '../../../assets/Logo/rzp_logo.png';

export default function InstallApp({handleInstall}) {
    const [isVisible, setIsVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
                    className={`fixed z-40 bg-zinc-900 md:left-6 rounded-xl shadow-lg bottom-14 md:bottom-6 overflow-hidden border border-zinc-800 ${isMobile ? 'bottom-0 left-0 right-0 m-4' : 'bottom-4 right-4 w-full max-w-sm'}`}
                >
                    <div className="relative p-4 sm:p-6">
                        <div className="absolute top-2 right-2">
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        <div className='flex md:flex-col justify-evenly align-center'>
                            <div className="flex items-center space-x-2 md:space-x-4">
                                <div className="flex-shrink-0 bg-gray-800 p-2 sm:p-3 rounded-full">
                                <img src={rzpLogo} alt="Logo" className="w-4 h-4 rounded-full" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-gray-100 font-bold text-sm sm:text-lg">Get Our App</h3>
                                    <p className="text-gray-400 hidden md:block text-xs sm:text-sm mt-1">Experience the full power of our platform</p>
                                </div>
                            </div>
                            <div className="mt-1 sm:mt-6">
                                <button
                                    onClick={handleInstall}
                                    className="w-full bg-white text-black font-semibold py-1 px-3 md:px-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2 group text-xs sm:text-base"
                                >
                                    <span>Install Now</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
