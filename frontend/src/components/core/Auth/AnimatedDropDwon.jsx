import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineHome, AiOutlineBook, AiOutlineFileDone, AiOutlineInfoCircle, AiOutlineContacts, AiOutlineLogin, AiOutlineUserAdd } from 'react-icons/ai';

const AnimatedDropdown = ({ isOpen, onClose }) => {
  const menuItems = [
    { to: "/", icon: AiOutlineHome, text: "Home" },
    { to: "/catalog/mock-tests", icon: AiOutlineBook, text: "Courses" },
    { to: "/mocktest", icon: AiOutlineFileDone, text: "Mock Tests" },
    { to: "/about", icon: AiOutlineInfoCircle, text: "About Us" },
    { to: "/contact", icon: AiOutlineContacts, text: "Contact Us" },
    { to: "/login", icon: AiOutlineLogin, text: "Log in" },
    { to: "/signup", icon: AiOutlineUserAdd, text: "Sign Up" }
  ];

  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: -20,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      }
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={dropdownVariants}
          className="absolute z-10 right-0 mt-2 w-64 rounded-md shadow-lg bg-black ring-1 border border-slate-700 ring-black ring-opacity-5 overflow-hidden"
        >
          <div className="py-1">
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.to}
                  className="flex items-center px-4 py-2 text-sm text-white hover:bg-slate-900 transition-colors duration-150"
                  onClick={onClose}
                >
                  <item.icon className="mr-3 text-lg" />
                  {item.text}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedDropdown;