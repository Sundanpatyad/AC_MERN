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
        (route) => matchPath({ path: route }, location.pathname),
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

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <>
            <motion.nav
                animate={{ y: hidden ? '-100%' : 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed top-0 left-0 right-0 z-[100] h-16 bg-page transition-colors duration-300 ${
                    isScrolled ? 'border-b border-line' : 'border-b border-transparent'
                }`}
            >
                <div className="page-shell h-full flex items-center justify-between gap-3">
                    <Link to="/" className="flex items-center gap-2.5 min-w-0 relative z-[101]">
                        <img
                            src={rzpLogo}
                            alt="Awakening Classes"
                            className="w-8 h-8 rounded-full shrink-0"
                        />
                        <span className="font-semibold text-[15px] sm:text-lg text-fg tracking-tight truncate">
                            Awakening Classes
                        </span>
                    </Link>

                    <ul className="hidden lg:flex items-center gap-1">
                        {NavbarLinks.map((link, index) => (
                            <li key={index} className="relative group">
                                {link.title === 'Courses' ? (
                                    <div className="flex items-center gap-1 cursor-pointer px-3 py-2 text-sm text-muted hover:text-fg transition-colors">
                                        <span>{link.title}</span>
                                        <MdKeyboardArrowDown className="group-hover:rotate-180 transition-transform duration-300" />
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                            <div className="w-52 bg-surface border border-line rounded-xl p-1.5 shadow-lg">
                                                {loading ? (
                                                    <div className="p-4 text-center">
                                                        <div className="w-4 h-4 border-2 border-line border-t-fg rounded-full animate-spin mx-auto" />
                                                    </div>
                                                ) : subLinks.length ? (
                                                    subLinks.map((subLink, i) => (
                                                        <Link
                                                            key={i}
                                                            to={`/catalog/${subLink.name.split(' ').join('-').toLowerCase()}`}
                                                            className="block px-3 py-2.5 text-sm text-muted hover:text-fg hover:bg-elevated rounded-lg transition-colors"
                                                        >
                                                            {subLink.name}
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <p className="p-3 text-sm text-subtle text-center">No categories</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        to={link?.path}
                                        className={`relative block px-3 py-2 text-sm transition-colors ${
                                            matchRoute(link?.path)
                                                ? 'text-fg font-medium'
                                                : 'text-muted hover:text-fg'
                                        }`}
                                    >
                                        {link.title}
                                        {matchRoute(link?.path) && (
                                            <motion.div
                                                layoutId="nav-underline"
                                                className="absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-fg"
                                            />
                                        )}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-1 sm:gap-2 relative z-[101]">
                        <button
                            onClick={() => setIsSearchModalOpen(true)}
                            aria-label="Search"
                            className="p-2 text-muted hover:text-fg hover:bg-elevated rounded-full transition-colors"
                        >
                            <AiOutlineSearch size={20} />
                        </button>

                        {user && user.accountType !== 'Instructor' && (
                            <Link
                                to="/dashboard/cart"
                                aria-label="Cart"
                                className="relative p-2 text-muted hover:text-fg hover:bg-elevated rounded-full transition-colors"
                            >
                                <CgShoppingCart size={20} />
                                {totalItems > 0 && (
                                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-brand text-[10px] font-semibold text-brand-fg rounded-full flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        )}

                        <div className="hidden md:flex items-center">
                            {token === null ? (
                                <div className="flex items-center gap-2 ml-1">
                                    <Link
                                        to="/login"
                                        className="px-3.5 py-2 text-sm font-medium text-muted hover:text-fg transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link to="/signup" className="btn-primary px-4 py-2">
                                        Sign up
                                    </Link>
                                </div>
                            ) : (
                                <ProfileDropDown />
                            )}
                        </div>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                            className="lg:hidden p-2 text-fg hover:bg-elevated rounded-full transition-colors"
                        >
                            {isMobileMenuOpen ? <IoClose size={24} /> : <HiBars3BottomRight size={24} />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 bg-[var(--c-overlay)] z-[99] lg:hidden"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                                className="fixed top-0 right-0 bottom-0 w-[min(100%,300px)] bg-page border-l border-line z-[100] p-5 pt-20 lg:hidden overflow-y-auto"
                            >
                                <div className="flex flex-col gap-1">
                                    {[
                                        { to: '/', icon: AiOutlineHome, text: 'Home' },
                                        { to: '/catalog/mock-tests', icon: AiOutlineBook, text: 'Courses' },
                                        { to: '/mocktest', icon: AiOutlineFileDone, text: 'Mock Tests' },
                                        { to: '/exams', icon: BsFiletypePdf, text: 'Free PDF' },
                                        { to: '/about', icon: AiOutlineInfoCircle, text: 'About' },
                                        { to: '/contact', icon: AiOutlineContacts, text: 'Contact' },
                                    ].map((item) => (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                                                matchRoute(item.to)
                                                    ? 'bg-elevated text-fg'
                                                    : 'text-muted hover:text-fg hover:bg-elevated'
                                            }`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <item.icon size={18} />
                                            <span className="text-sm font-medium">{item.text}</span>
                                        </Link>
                                    ))}

                                    <div className="h-px bg-line my-3" />

                                    {token === null ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link
                                                to="/login"
                                                className="btn-secondary"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Log in
                                            </Link>
                                            <Link
                                                to="/signup"
                                                className="btn-primary"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Sign up
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

            <div className="h-16" />

            {deferredPrompt && <InstallApp handleInstall={handleInstallClick} />}

            <AnimatePresence>
                {isSearchModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4 bg-[var(--c-overlay)] backdrop-blur-sm"
                        onClick={() => setIsSearchModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xl bg-page border border-line rounded-2xl p-5 sm:p-6 shadow-xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-fg">Search</h2>
                                <button
                                    onClick={() => setIsSearchModalOpen(false)}
                                    aria-label="Close search"
                                    className="p-2 text-muted hover:text-fg transition-colors rounded-full"
                                >
                                    <RxCross1 size={18} />
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
