import React from 'react';
import { VscDashboard } from 'react-icons/vsc';
import { AiOutlineHome } from 'react-icons/ai';
import { PiNotebook } from 'react-icons/pi';
import { TbMessage2Plus } from 'react-icons/tb';
import { MdOutlineContactPhone } from 'react-icons/md';
import { FaRegUser } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { HiAcademicCap } from "react-icons/hi2";
import { CgShoppingCart } from "react-icons/cg";

const BottomBar = () => {
  return (
    <div className="fixed bottom-0 md:hidden left-0 right-0 z-50 bg-transparent backdrop-blur-md  shadow-lg">
      <nav className="flex justify-around py-2">
        <NavItem to="/" icon={AiOutlineHome} label="Home" />
        <NavItem to="/catalog/mock-tests" icon={PiNotebook} label="Courses" />
        <NavItem to="/mocktest" icon={HiAcademicCap} label="Mock Tests" />
        <NavItem to="/dashboard/cart" icon={CgShoppingCart} label="Mock Tests" />
        <NavItem to="/dashboard/my-profile" icon={FaRegUser} label="Profile" />
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label }) => (
  <Link to={to} className="flex flex-col text-xs items-center  text-white p-1 hover:bg-slate-300 rounded-full hover:text-black ">
    <Icon className="text-xl mb-1" />
  </Link>
);

export default BottomBar;
