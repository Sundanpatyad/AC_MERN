import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from 'framer-motion';
import { NavbarLinks } from '../../../data/navbar-links';
import { fetchCourseCategories } from './../../services/operations/courseDetailsAPI';
import ProfileDropDown from '../core/Auth/ProfileDropDown';
import MobileProfileDropDown from '../core/Auth/MobileProfileDropDown';
import { BsFiletypePdf } from "react-icons/bs";

import {
    AiOutlineSearch,
    AiOutlineHome,
    AiOutlineBook,
    AiOutlineFileDone,
    AiOutlineInfoCircle,
    AiOutlineContacts,
} from 'react-icons/ai';
import { HiBars3BottomRight } from 'react-icons/hi2';
import { IoClose } from 'react-icons/io5';
import { MdKeyboardArrowDown } from 'react-icons/md';
import rzpLogo from '../../assets/Logo/logo.png';
import { PlaceholdersAndVanishInputDemo } from '../ui/Search';
import { RxCross1 } from 'react-icons/rx';
import { CgShoppingCart } from 'react-icons/cg';
import InstallApp from '../core/HomePage/installApp';

const SCROLL_THRESHOLD = 50;

const Navbar = () => {
    const { token } = useSelector((state) => state.auth);
    const location = useLocation();

    const [subLinks, setSubLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const { totalItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.profile);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const lastScrollY = useRef(0);

    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, 'change', (latest) => {
        if (latest > lastScrollY.current && latest > SCROLL_THRESHOLD) {
            setHidden(true);
        } else {
            setHidden(false);
        }
        setIsScrolled(latest > 20);
        lastScrollY.current = latest;
    });

    const fetchSublinks = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchCourseCategories();
            setSubLinks(res || []);
        } catch (error) {
            console.error("Error fetching sublinks", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSublinks();
    }, [fetchSublinks]);

    const matchRoute = useCallback(
        (route) => {
            return matchPath({ path: route }, location.pathname);
        },
        [location.pathname]
    );

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
        }
    };

    // Prevent scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const navVariants = {
        visible: {
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 30 },
        },
        hidden: {
            y: '-100%',
            transition: { type: 'spring', stiffness: 300, damping: 30 },
        },
    };

    return (
        <>
            <motion.nav
                variants={navVariants}
                animate={hidden ? 'hidden' : 'visible'}
                initial="visible"
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
                    ? 'py-2 md:py-3 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50'
                    : 'py-4 md:py-6 bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group relative z-[101]">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-emerald-600 rounded-full blur opacity-0 group-hover:opacity-75 transition duration-500" />
                            <img src={rzpLogo} alt="Logo" className="relative w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10" />
                        </div>
                        <span className="font-outfit font-bold text-lg md:text-2xl text-white tracking-tight group-hover:text-blue-400 transition-colors">
                            Awakening Classes
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className="hidden lg:flex items-center gap-8">
                        {NavbarLinks.map((link, index) => (
                            <li key={index} className="relative group">
                                {link.title === 'Courses' ? (
                                    <div className="flex items-center gap-1 cursor-pointer text-white/70 hover:text-white transition-colors duration-300 py-2">
                                        <span className="font-medium">{link.title}</span>
                                        <MdKeyboardArrowDown className="group-hover:rotate-180 transition-transform duration-300" />

                                        {/* Dropdown Menu */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                            <div className="w-56 glass border border-white/10 rounded-2xl p-2 shadow-2xl">
                                                {loading ? (
                                                    <div className="p-4 text-center">
                                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                                                    </div>
                                                ) : subLinks.length ? (
                                                    subLinks.map((subLink, i) => (
                                                        <Link
                                                            key={i}
                                                            to={`/catalog/${subLink.name.split(' ').join('-').toLowerCase()}`}
                                                            className="block px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                                        >
                                                            {subLink.name}
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <p className="p-4 text-sm text-white/40 text-center">No categories found</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        to={link?.path}
                                        className={`relative py-2 font-medium transition-colors duration-300 ${matchRoute(link?.path) ? 'text-white' : 'text-white/60 hover:text-white'
                                            }`}
                                    >
                                        {link.title}
                                        {matchRoute(link?.path) && (
                                            <motion.div
                                                layoutId="nav-underline"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                                            />
                                        )}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Actions */}
                    <div className="flex items-center gap-3 md:gap-6 relative z-[101]">
                        {/* Search */}
                        <button
                            onClick={() => setIsSearchModalOpen(true)}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-all"
                        >
                            <AiOutlineSearch size={22} />
                        </button>

                        {/* Cart */}
                        {user && user.accountType !== 'Instructor' && (
                            <Link to='/dashboard/cart' className="relative p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-all">
                                <CgShoppingCart size={22} />
                                {totalItems > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center border border-black animate-in fade-in zoom-in duration-300">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Auth / Profile */}
                        <div className="hidden md:block">
                            {token === null ? (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="px-5 py-2 text-sm font-bold text-white/70 hover:text-white transition-all">
                                        Log In
                                    </Link>
                                    <Link to="/signup" className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
                                        Sign Up
                                    </Link>
                                </div>
                            ) : (
                                <ProfileDropDown />
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            {isMobileMenuOpen ? <IoClose size={28} /> : <HiBars3BottomRight size={28} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[99]"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 bottom-0 w-[280px] bg-zinc-950 border-l border-white/10 z-[100] p-6 pt-24"
                            >
                                <div className="flex flex-col gap-4">
                                    {[
                                        { to: '/', icon: AiOutlineHome, text: 'Home' },
                                        { to: '/catalog/mock-tests', icon: AiOutlineBook, text: 'Courses' },
                                        { to: '/mocktest', icon: AiOutlineFileDone, text: 'Mock Tests' },
                                        { to: "/exams", icon: BsFiletypePdf, text: "Free Pdf" },
                                        { to: '/about', icon: AiOutlineInfoCircle, text: 'About Us' },
                                        { to: '/contact', icon: AiOutlineContacts, text: 'Contact Us' },
                                    ].map((item, index) => (
                                        <Link
                                            key={index}
                                            to={item.to}
                                            className="flex items-center gap-4 px-4 py-4 text-white/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <item.icon size={20} />
                                            <span className="font-medium">{item.text}</span>
                                        </Link>
                                    ))}

                                    <div className="h-px bg-white/10 my-4" />

                                    {token === null ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link
                                                to="/login"
                                                className="flex items-center justify-center py-3 bg-white/5 text-white font-bold rounded-2xl"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Log In
                                            </Link>
                                            <Link
                                                to="/signup"
                                                className="flex items-center justify-center py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Sign Up
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center py-2">
                                            <MobileProfileDropDown />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Spacer */}
            <div className="h-[72px] md:h-[88px]" />

            {deferredPrompt && <InstallApp handleInstall={handleInstallClick} />}

            {/* Search Modal */}
            <AnimatePresence>
                {isSearchModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="w-full max-w-2xl glass border border-white/10 rounded-[2rem] p-8 shadow-2xl relative"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Search Knowledge</h2>
                                <button
                                    onClick={() => setIsSearchModalOpen(false)}
                                    className="p-2 text-white/40 hover:text-white transition-colors"
                                >
                                    <RxCross1 size={20} />
                                </button>
                            </div>
                            <PlaceholdersAndVanishInputDemo onResultClick={() => setIsSearchModalOpen(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default React.memo(Navbar);