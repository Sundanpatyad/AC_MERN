import React from 'react';
import { AiOutlineHome } from 'react-icons/ai';
import { PiNotebook } from 'react-icons/pi';
import { HiAcademicCap } from "react-icons/hi2";
import { CgShoppingCart } from "react-icons/cg";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CiCirclePlus } from "react-icons/ci";

const BottomBar = () => {
  const { totalItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.profile);

  return (
    <div className="fixed bottom-0 md:hidden left-0 right-0 bg-transparent backdrop-blur-md shadow-lg">
      <nav className="flex justify-around py-2">
        <NavItem to="/" icon={AiOutlineHome} label="Home" />
        <NavItem to="/mocktest" icon={HiAcademicCap} label="Tests" />

        {user && user.accountType !== 'Instructor' ? (
          <NavItem to="/catalog/mock-tests" icon={PiNotebook} label="Courses" />
        ) : (
          <NavItem to="/createStudyMaterial" icon={CiCirclePlus} label="Add Pdf" />
        )}
        {user && user.accountType !== 'Instructor' ? (
          <NavItem to="/dashboard/cart" icon={CgShoppingCart} label="Cart" badge={totalItems} />
        ) : (
          <NavItem to="/dashboard/my-courses" icon={MdOutlineAdminPanelSettings} label="Admin" />
        )}
        <Link to="/dashboard/my-profile" className="flex items-center flex-col justify-center">
          <div className="flex items-center gap-x-1">
            <img
              src={user?.image}
              alt={`profile-${user?.firstName}`}
              className={'aspect-square w-[22px] rounded-full object-cover'}
            />
          </div>
          <p className='text-white text-xs mt-1'>You</p>
        </Link>
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label, badge }) => (
  <div className='flex flex-row justify-evenly'>
    <Link to={to} className="relative flex flex-col text-xs items-center text-slate-300 p-1 rounded-full hover:text-white">
      <Icon className="text-xl mb-1" />
      {badge > 0 && (
        <span className="absolute -top-2 -right-2 bg-white text-zinc-900 font-semibold text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {badge}
        </span>
      )}
      <span className="text-xs">{label}</span>
    </Link>
  </div>
);

export default BottomBar;
