import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useOnClickOutside from "../../../hooks/useOnClickOutside";
import Img from "./../../common/Img";
import { logout } from "../../../services/operations/authAPI";
import { VscDashboard, VscSignOut } from "react-icons/vsc";
import { AiOutlineCaretDown, AiOutlineHome } from "react-icons/ai";
import { MdOutlineContactPhone } from "react-icons/md";
import { TbMessage2Plus } from "react-icons/tb";
import { PiNotebook } from "react-icons/pi";
import { fetchCourseCategories } from "./../../../services/operations/courseDetailsAPI";
import { motion, AnimatePresence } from "framer-motion";
import { BsFiletypePdf, BsExclamationTriangle } from "react-icons/bs";
import { FiLogOut } from "react-icons/fi";
import { FaRankingStar } from "react-icons/fa6";

export default function MobileProfileDropDown() {
    const { user } = useSelector((state) => state.profile);
    if (!user) return null;

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const ref = useRef(null);
    const modalRef = useRef(null);

    useOnClickOutside(ref, () => setOpen(false));
    useOnClickOutside(modalRef, () => setShowLogoutConfirmation(false));

    const [open, setOpen] = useState(false);
    const [subLinks, setSubLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

    const fetchSublinks = async () => {
        try {
            setLoading(true);
            const res = await fetchCourseCategories();
            setSubLinks(res);
        } catch (error) {}
        setLoading(false);
    };

    useEffect(() => {
        fetchSublinks();
    }, []);

    const handleLogout = () => {
        setShowLogoutConfirmation(true);
        setOpen(false);
    };

    const confirmLogout = () => {
        dispatch(logout(navigate));
        setShowLogoutConfirmation(false);
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    };

    return (
        <div className="relative sm:hidden">
            <button 
                className="flex items-center gap-x-1 bg-transparent p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
                onClick={() => setOpen(!open)}
            >
                <Img
                    src={user?.image}
                    alt={`profile-${user?.firstName}`}
                    className="aspect-square w-[22px] rounded-full object-cover"
                />
                <AiOutlineCaretDown className={`text-sm text-white transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dropdownVariants}
                        className="absolute min-w-[200px] top-[118%] py-4 px-2 right-0 mt-2 w-60 z-[1000] overflow-hidden rounded-lg border-[1px] border-white/20 bg-transparent backdrop-blur-md"
                        ref={ref}
                    >
                        {[
                            { to: "/dashboard/my-profile", icon: VscDashboard, label: "Profile" },
                            { to: "/", icon: AiOutlineHome, label: "Home" },
                            { to: "/catalog/mock-tests", icon: PiNotebook, label: "Courses" },
                            { to: "/mocktest", icon: PiNotebook, label: "Mock Tests" },
                            { to: "/rankings", icon: FaRankingStar, label: "Rankings" },
                            { to: "/exams", icon: BsFiletypePdf, label: "Free Pdf" },
                            { to: "/about", icon: TbMessage2Plus, label: "About Us" },
                            { to: "/contact", icon: MdOutlineContactPhone, label: "Contact Us" },
                        ].map((item, index) => (
                            <div key={index}>
                                <Link to={item.to} onClick={() => setOpen(false)}>
                                    <div className="flex w-full items-center gap-x-2 py-3 px-4 text-sm font-semibold text-white hover:bg-white/20 transition-colors duration-300 rounded-lg">
                                        <item.icon className="text-lg text-white" />
                                        {item.label}
                                    </div>
                                </Link>
                            </div>
                        ))}
                        {/* Logout button */}
                        <div>
                            <div
                                onClick={handleLogout}
                                className="flex w-full items-center gap-x-2 py-3 px-4 text-sm text-red-500 font-semibold bg-white/20 transition-colors duration-300 cursor-pointer rounded-lg"
                            >
                                <VscSignOut className="text-lg text-red-500" />
                                Logout
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLogoutConfirmation && (
                    <div className="fixed inset-0 z-50 h-screen w-screen flex items-center justify-center p-4 backdrop-blur-md">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={modalVariants}
                            className="relative"  // Add relative positioning
                        >
                            <div 
                                ref={modalRef}
                                className="bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6"
                            >
                                <div className="flex items-center mb-4">
                                    <BsExclamationTriangle className="text-yellow-500 text-2xl mr-3" />
                                    <h3 className="text-lg font-semibold text-slate-300">
                                        Confirm Logout
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-300 mb-4">
                                    Are you sure you want to logout? This action will end your current session.
                                </p>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setShowLogoutConfirmation(false)}
                                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
                                    >
                                        <AiOutlineHome className="mr-2" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmLogout}
                                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                                    >
                                        <FiLogOut className="mr-2" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}