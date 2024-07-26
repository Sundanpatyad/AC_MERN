import React, { useState, useEffect } from 'react'
import { Link, matchPath, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { NavbarLinks } from "../../../data/navbar-links"
import { fetchCourseCategories } from './../../services/operations/courseDetailsAPI'
import ProfileDropDown from '../core/Auth/ProfileDropDown'
import MobileProfileDropDown from '../core/Auth/MobileProfileDropDown'
import { AiOutlineShoppingCart, AiOutlineUser } from "react-icons/ai"
import { MdKeyboardArrowDown } from "react-icons/md"
import { motion } from 'framer-motion'
import rzpLogo from "../../assets/Logo/rzp_logo.png";

const Navbar = () => {
    const { token } = useSelector((state) => state.auth)
    const { user } = useSelector((state) => state.profile)
    const { totalItems } = useSelector((state) => state.cart)
    const location = useLocation()

    const [subLinks, setSubLinks] = useState([])
    const [loading, setLoading] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const fetchSublinks = async () => {
        try {
            setLoading(true)
            const res = await fetchCourseCategories()
            setSubLinks(res)
        } catch (error) {
            console.log("Could not fetch the category list = ", error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchSublinks()
    }, [])

    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname)
    }

    return (
        <>
            <motion.nav 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled ? 'bg-richblack-900 bg-opacity-90 backdrop-blur-md shadow-lg' : 'bg-transparent'
                }`}
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
                                        className={`text-white hover:text-blue-200 transition-colors duration-200 ${
                                            matchRoute(link?.path) ? 'font-semibold' : ''
                                        }`}
                                    >
                                        {link.title}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className='flex items-center space-x-2 sm:space-x-4'>
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
                                    className="flex items-center space-x-1 text-white hover:text-blue-200 transition-colors duration-200"
                                >
                                    <AiOutlineUser className="text-xl sm:text-2xl" />
                                    <MdKeyboardArrowDown className={`transition-transform duration-200 ${isAuthDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isAuthDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5">
                                        <div className="py-1">
                                            <Link 
                                                to="/login" 
                                                className="block px-4 py-2 text-sm text-white hover:bg-slate-600"
                                                onClick={() => setIsAuthDropdownOpen(false)}
                                            >
                                                Log in
                                            </Link>
                                            <Link 
                                                to="/signup" 
                                                className="block px-4 py-2 text-sm text-white hover:bg-slate-600"
                                                onClick={() => setIsAuthDropdownOpen(false)}
                                            >
                                                Sign Up
                                            </Link>
                                        </div>
                                    </div>
                                )}
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
            {/* This div acts as a spacer to prevent content from being hidden behind the navbar */}
            <div className="h-[64px] md:h-[72px]"></div>
        </>
    )
}

export default Navbar