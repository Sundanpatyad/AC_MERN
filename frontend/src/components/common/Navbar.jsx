import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from 'framer-motion';
import { NavbarLinks } from '../../../data/navbar-links';
import { useCategories } from '../../hooks/useCategories';
import { logout } from '../../services/operations/authAPI';
import ProfileDropDown from '../core/Auth/ProfileDropDown';
import ConfirmationModal from './ConfirmationModal';
import Img from './Img';
import ThemeToggle from './ThemeToggle';
import { BsFiletypePdf } from "react-icons/bs";
import { FaRankingStar } from 'react-icons/fa6';
import { VscDashboard, VscShield, VscSignOut } from 'react-icons/vsc';
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
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { data: subLinks = [], isLoading: loading } = useCategories();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const { totalItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.profile);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState(null);
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
        if (!isMobileMenuOpen) return;
        const onKeyDown = (e) => e.key === 'Escape' && setIsMobileMenuOpen(false);
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
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
                        <ThemeToggle />
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
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Open menu"
                            aria-expanded={isMobileMenuOpen}
                            className="lg:hidden p-2 text-fg hover:bg-elevated rounded-full transition-colors"
                        >
                            <HiBars3BottomRight size={24} />
                        </button>
                    </div>
                </div>

            </motion.nav>

            {/* Rendered outside the nav: the nav's transform would otherwise become
                the containing block and clip these fixed layers to its 64px height. */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-[var(--c-overlay)] z-[110] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                            className="fixed top-0 right-0 bottom-0 w-[min(85%,320px)] bg-page border-l border-line z-[120] flex flex-col lg:hidden"
                        >
                            <div className="h-16 shrink-0 flex items-center justify-between gap-3 px-5 border-b border-line">
                                <span className="text-sm font-semibold text-fg tracking-tight truncate">
                                    Menu
                                </span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-label="Close menu"
                                    className="p-2 -mr-2 text-fg hover:bg-elevated rounded-full transition-colors"
                                >
                                    <IoClose size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex flex-col gap-1">
                                {[
                                    { to: '/', icon: AiOutlineHome, text: 'Home' },
                                    { to: '/catalog/mock-tests', icon: AiOutlineBook, text: 'Courses' },
                                    { to: '/mocktest', icon: AiOutlineFileDone, text: 'Mock Tests' },
                                    { to: '/rankings', icon: FaRankingStar, text: 'Rankings' },
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
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3 px-3 py-2">
                                            <Img
                                                src={user?.image}
                                                alt={user?.firstName || 'Profile'}
                                                className="w-9 h-9 rounded-full object-cover shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-fg truncate">
                                                    {`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'My account'}
                                                </p>
                                                <p className="text-xs text-subtle truncate">{user?.email}</p>
                                            </div>
                                        </div>

                                        <Link
                                            to="/dashboard/my-profile"
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted hover:text-fg hover:bg-elevated transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <VscDashboard size={18} />
                                            <span className="text-sm font-medium">Dashboard</span>
                                        </Link>

                                        {user?.accountType === 'Instructor' && (
                                            <Link
                                                to="/adminMockTest"
                                                className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted hover:text-fg hover:bg-elevated transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <VscShield size={18} />
                                                <span className="text-sm font-medium">Admin Console</span>
                                            </Link>
                                        )}

                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                setConfirmationModal({
                                                    text1: 'Are you sure?',
                                                    text2: 'You will be logged out of your account.',
                                                    btn1Text: 'Log out',
                                                    btn2Text: 'Cancel',
                                                    btn1Handler: () => dispatch(logout(navigate)),
                                                    btn2Handler: () => setConfirmationModal(null),
                                                });
                                            }}
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-brand hover:bg-elevated transition-colors text-left"
                                        >
                                            <VscSignOut size={18} />
                                            <span className="text-sm font-medium">Log out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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

            {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
        </>
    );
};

export default React.memo(Navbar);
