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
import { useSelector } from 'react-redux';

const BottomBar = () => {
  const { totalItems } = useSelector((state) => state.cart);
  return (
    <div className="fixed bottom-0 md:hidden left-0 right-0 z-50 bg-transparent backdrop-blur-md shadow-lg">
      <nav className="flex justify-around py-2">
        <NavItem to="/" icon={AiOutlineHome} label="Home" />
        <NavItem to="/catalog/mock-tests" icon={PiNotebook} label="Courses" />
        <NavItem to="/mocktest" icon={HiAcademicCap} label="Mock Tests" />
        <NavItem to="/dashboard/cart" icon={CgShoppingCart} label="Cart" badge={totalItems} />
        <NavItem to="/dashboard/my-profile" icon={FaRegUser} label="Profile" />
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label, badge }) => (
  <Link to={to} className="relative flex flex-col text-xs items-center text-white p-1 hover:bg-slate-300 rounded-full hover:text-black">
    <Icon className="text-xl mb-1" />
    {badge > 0 && (
      <span className="absolute -top-2 -right-2 bg-white text-zinc-900 font-semibold text-xs rounded-full h-4 w-4 flex items-center justify-center">
        {badge}
      </span>
    )}
  </Link>
);

export default BottomBar;
