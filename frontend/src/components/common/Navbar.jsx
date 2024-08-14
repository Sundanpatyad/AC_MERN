import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, matchPath, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, useMotionValueEvent, useScroll } from "framer-motion"
import { NavbarLinks } from "../../../data/navbar-links"
import { fetchCourseCategories } from './../../services/operations/courseDetailsAPI'
import ProfileDropDown from '../core/Auth/ProfileDropDown'
import MobileProfileDropDown from '../core/Auth/MobileProfileDropDown'
import { AiOutlineShoppingCart, AiOutlineSearch, AiOutlineHome, AiOutlineBook, AiOutlineFileDone, AiOutlineInfoCircle, AiOutlineContacts, AiOutlineLogin, AiOutlineUserAdd } from "react-icons/ai"
import { HiBars2 } from "react-icons/hi2"
import { MdKeyboardArrowDown } from "react-icons/md"
import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { PlaceholdersAndVanishInputDemo } from '../ui/Search'
import { RxCross1 } from "react-icons/rx"
import { AnimatePresence } from 'framer-motion';

const SCROLL_THRESHOLD = 50

const Navbar = () => {
    const { token } = useSelector((state) => state.auth)
    const { user } = useSelector((state) => state.profile)
    const { totalItems } = useSelector((state) => state.cart)
    const location = useLocation()

    const [subLinks, setSubLinks] = useState([])
    const [loading, setLoading] = useState(false)
    const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false)
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
    const [hidden, setHidden] = useState(false)
    const searchModalRef = useRef(null)
    const lastScrollY = useRef(0)

    const { scrollY } = useScroll()

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > lastScrollY.current && latest > SCROLL_THRESHOLD) {
            setHidden(true)
        } else {
            setHidden(false)
        }
        lastScrollY.current = latest
    })

    const fetchSublinks = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetchCourseCategories()
            setSubLinks(res)
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSublinks()
    }, [fetchSublinks])

    const matchRoute = useCallback((route) => {
        return matchPath({ path: route }, location.pathname)
    }, [location.pathname])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchModalRef.current && !searchModalRef.current.contains(event.target)) {
                setIsSearchModalOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleSearchResultClick = () => {
        setIsSearchModalOpen(false)
    }

    const navVariants = {
        visible: {
            y: 0,
            backgroundColor: scrollY.get() > SCROLL_THRESHOLD ? "rgba(0, 0, 0, 0.8)" : "transparent",
            transition: {
                y: { type: "spring", stiffness: 300, damping: 30 },
                backgroundColor: { duration: 0.2 }
            }
        },
        hidden: {
            y: "-100%",
            transition: {
                y: { type: "spring", stiffness: 300, damping: 30 },
            }
        }
    }

    return (
        <>
            <motion.nav
                variants={navVariants}
                animate={hidden ? "hidden" : "visible"}
                initial="visible"
                className="fixed top-0 left-0 right-0 z-50"
            >
                <div className='flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto'>
                    <Link to="/" className='flex items-center space-x-2'>
                        <img src={rzpLogo} alt="Logo" className='w-8 h-8 rounded-full' />
                        <h1 className='font-semibold text-sm md:text-xl text-white'>Awakening Classes</h1>
                    </Link>

                    <ul className='hidden md:flex space-x-8'>
                        {NavbarLinks.map((link, index) => (
                            <li key={index} className='relative group'>
                                {link.title === "Courses" ? (
                                    <div className='flex items-center space-x-1 cursor-pointer text-white group-hover:text-blue-200 transition-colors duration-200'>
                                        <span>{link.title}</span>
                                        <MdKeyboardArrowDown className='group-hover:rotate-180 transition-transform duration-200' />
                                        <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                            <div className="py-1">
                                                {loading ? (
                                                    <p className="px-4 py-2 text-sm text-gray-700">Loading...</p>
                                                ) : subLinks.length ? (
                                                    subLinks.map((subLink, i) => (
                                                        <Link
                                                            key={i}
                                                            to={`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`}
                                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            {subLink.name}
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <p className="px-4 py-2 text-sm text-gray-700">No Courses Found</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        to={link?.path}
                                        className={`text-white hover:text-blue-200 transition-colors duration-200 ${matchRoute(link?.path) ? 'font-semibold' : ''
                                            }`}
                                    >
                                        {link.title}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className='flex items-center space-x-2 sm:space-x-4'>
                        <button
                            onClick={() => setIsSearchModalOpen(true)}
                            className="text-white hover:text-blue-200 transition-colors duration-200"
                        >
                            <AiOutlineSearch className="text-xl sm:text-2xl" />
                        </button>

                        {user && user?.accountType !== "Instructor" && (
                            <Link to="/dashboard/cart" className="relative text-white hover:text-blue-200 transition-colors duration-200">
                                <AiOutlineShoppingCart className="text-xl sm:text-2xl" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-white text-richblack-900 rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-[10px] sm:text-xs font-bold">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        )}
                        {token === null ? (
                            <div className="relative group">
                                <button
                                    onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
                                    className="flex items-center space-x-1 text-white transition-colors duration-200 p-2 rounded-md bg-transparent"
                                >
                                    <HiBars2 className={`transition-transform duration-200 ${isAuthDropdownOpen ? 'rotate-180' : ''} text-xl`} />
                                </button>
                                <AnimatePresence>
                                    {isAuthDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute z-10 py-2 px-2 right-0 mt-2 w-64 rounded-md shadow-lg bg-black ring-1 border border-slate-700 ring-black ring-opacity-5 overflow-hidden"
                                        >
                                            <motion.div className="py-1">
                                                {[
                                                    { to: "/", icon: AiOutlineHome, text: "Home" },
                                                    { to: "/catalog/mock-tests", icon: AiOutlineBook, text: "Courses" },
                                                    { to: "/mocktest", icon: AiOutlineFileDone, text: "Mock Tests" },
                                                    { to: "/about", icon: AiOutlineInfoCircle, text: "About Us" },
                                                    { to: "/contact", icon: AiOutlineContacts, text: "Contact Us" },
                                                    { to: "/login", icon: AiOutlineLogin, text: "Log in" },
                                                    { to: "/signup", icon: AiOutlineUserAdd, text: "Sign Up" }
                                                ].map((item, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                                    >
                                                        <Link
                                                            to={item.to}
                                                            className="flex items-center px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors duration-150"
                                                            onClick={() => setIsAuthDropdownOpen(false)}
                                                        >
                                                            <item.icon className="mr-3 text-lg" />
                                                            {item.text}
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <div className='hidden sm:block'>
                                    <ProfileDropDown />
                                </div>
                                <div className='sm:hidden'>
                                    <MobileProfileDropDown />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* Spacer to prevent content from being hidden behind the navbar */}
            <div className="h-[64px] md:h-[72px]"></div>

            {/* Search Modal */}
            {isSearchModalOpen && (
                <div className="fixed inset-0 z-50 flex py-10 justify-center align-top bg-black bg-opacity-75">
                    <div
                        className="bg-transparent rounded-lg p-6 mb-40  w-full max-w-lg"
                        ref={searchModalRef}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl :md:text-xl font-semibold text-white">Search</h2>
                            <button
                                onClick={() => setIsSearchModalOpen(false)}
                                className="text-gray-400 hover:text-gray-200"
                            >
                                <RxCross1 />
                            </button>
                        </div>
                        <PlaceholdersAndVanishInputDemo
                            onResultClick={handleSearchResultClick}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default React.memo(Navbar)