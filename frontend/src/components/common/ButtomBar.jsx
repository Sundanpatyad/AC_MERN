import React from 'react';
import { VscDashboard } from 'react-icons/vsc';
import { AiOutlineHome } from 'react-icons/ai';
import { PiNotebook } from 'react-icons/pi';
import { TbMessage2Plus } from 'react-icons/tb';
import { MdOutlineContactPhone } from 'react-icons/md';
import { FaRegUser } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { HiAcademicCap } from "react-icons/hi2";

const BottomBar = () => {
  return (
    <div className="fixed bottom-0 md:hidden left-0 right-0 z-50 bg-transparent backdrop-blur-md  shadow-lg">
      <nav className="flex justify-around py-2">
        <NavItem to="/" icon={AiOutlineHome} label="Home" />
        <NavItem to="/catalog/mock-tests" icon={PiNotebook} label="Courses" />
        <NavItem to="/mocktest" icon={HiAcademicCap} label="Mock Tests" />
        <NavItem to="/dashboard/my-profile" icon={FaRegUser} label="Profile" />
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label }) => (
  <Link to={to} className="flex flex-col text-xs items-center  text-white hover:text-gray-900">
    <Icon className="text-xl mb-1" />
  </Link>
);

export default BottomBar;
