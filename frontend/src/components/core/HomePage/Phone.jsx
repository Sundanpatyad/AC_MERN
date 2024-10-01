import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserMobileNumber } from '../../../slices/profileSlice';
import { X, Phone, Info, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileNumberDrawer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');
    const [isValidNumber, setIsValidNumber] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const drawerRef = useRef(null);
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector(state => state.profile);
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        setIsOpen(true);
    }, []);

    const validateMobileNumber = (number) => {
        const regex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
        return regex.test(number);
    };

    const handleMobileNumberChange = (e) => {
        const number = e.target.value;
        setMobileNumber(number);
        setIsValidNumber(validateMobileNumber(number));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isValidNumber) {
            try {
                await dispatch(updateUserMobileNumber(user._id, mobileNumber, token));

            } catch (err) {
                // Error is handled by the redux slice
            }
        }
    };

    const handleClose = () => {
        // Implement close functionality if needed
    };

    const handleOutsideClick = (e) => {
        if (drawerRef.current && !drawerRef.current.contains(e.target)) {
            handleClose();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const drawerVariants = {
        hidden: { y: "100%" },
        visible: { y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    };

    const successVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-black bg-opacity-60 flex items-end justify-center"
                >
                    <motion.div
                        variants={drawerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="w-full max-w-md backdrop-blur-lg rounded-t-3xl shadow-2xl border-t border-gray-700 overflow-hidden"
                    >
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-bold text-white">Awakening Classes</h2>
                            </div>

                            <div className="space-y-4">
                                <p className="text-gray-300">Join our exclusive Awakening Classes by providing your mobile number below.</p>
                                <button
                                    onClick={() => setShowInfo(!showInfo)}
                                    className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    <Info size={20} className="mr-2" />
                                    {showInfo ? "Hide Info" : "What are Awakening Classes?"}
                                </button>

                                <AnimatePresence>
                                    {showInfo && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-gray-800 p-4 rounded-lg"
                                        >
                                            <p className="text-gray-300">
                                                Welcome all to the family of learners..If you are preparing for any competitive exam,
                                                if you are trying to boost your knowledge, you are in a safe place.
                                                In this channel, we mainly teach:
                                            </p>
                                            <ol className="list-decimal list-inside text-xs text-gray-300 space-y-2">
                                                <li>HISTORY</li>
                                                <li>POLITY</li>
                                                <li>GEOGRAPHY</li>
                                                <li>ECONOMICS</li>
                                                <li>GENERAL SCIENCE</li>
                                            </ol>
                                            <p className="text-gray-300 mt-4">
                                                And many more... The way of communication is Hindi + English. LEARN TO EMPOWER.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-400">
                                        Mobile Number
                                    </label>
                                    <div className="relative">
                                        <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                        <input
                                            id="mobileNumber"
                                            type="tel"
                                            placeholder="Enter your mobile number"
                                            value={mobileNumber}
                                            onChange={handleMobileNumberChange}
                                            required
                                            className="w-full p-4 pl-10 pr-10 rounded-md bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                                        />
                                        {isValidNumber && (
                                            <Check size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                                        )}
                                    </div>
                                    {mobileNumber && !isValidNumber && (
                                        <p className="text-red-500 text-sm mt-1">Please enter a valid mobile number.</p>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 flex items-start"
                                        >
                                            <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-1" size={20} />
                                            <p className="text-red-100 text-sm">{error}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex space-x-4">
                                    <button
                                        type="submit"
                                        disabled={loading || !isValidNumber}
                                        className="flex-1 p-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg hover:shadow-indigo-500/40 transition-all duration-200 ease-in-out disabled:bg-indigo-400 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Updating...' : 'Join Now'}
                                    </button>
                                </div>
                            </form>

                            <AnimatePresence>
                                {showSuccess && (
                                    <motion.div
                                        variants={successVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        className="fixed inset-0 flex items-center justify-center z-50"
                                    >
                                        <div className="bg-green-500 bg-opacity-90 rounded-full p-8">
                                            <Check size={48} className="text-white" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MobileNumberDrawer;