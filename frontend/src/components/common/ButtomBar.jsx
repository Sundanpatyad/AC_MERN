import React from 'react';
import { AiOutlineHome } from 'react-icons/ai';
import { PiNotebook } from 'react-icons/pi';
import { HiAcademicCap } from 'react-icons/hi2';
import { CgShoppingCart } from 'react-icons/cg';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CiCirclePlus } from 'react-icons/ci';

const BottomBar = () => {
  const { totalItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.profile);
  const location = useLocation();

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const profileInitial =
    user?.firstName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    'U';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] border-t border-line bg-page pb-[env(safe-area-inset-bottom)]">
      <nav className="grid grid-cols-5 h-16 px-1">
        <NavItem to="/" icon={AiOutlineHome} label="Home" active={isActive('/')} />
        <NavItem to="/mocktest" icon={HiAcademicCap} label="Tests" active={isActive('/mocktest')} />

        {user?.accountType !== 'Instructor' ? (
          <NavItem
            to="/catalog/mock-tests"
            icon={PiNotebook}
            label="Courses"
            active={isActive('/catalog')}
          />
        ) : (
          <NavItem
            to="/createStudyMaterial"
            icon={CiCirclePlus}
            label="Add PDF"
            active={isActive('/createStudyMaterial')}
          />
        )}

        {user?.accountType !== 'Instructor' ? (
          <NavItem
            to="/dashboard/cart"
            icon={CgShoppingCart}
            label="Cart"
            badge={totalItems}
            active={isActive('/dashboard/cart')}
          />
        ) : (
          <NavItem
            to="/adminMockTest"
            icon={MdOutlineAdminPanelSettings}
            label="Admin"
            active={isActive('/adminMockTest')}
          />
        )}

        <Link
          to="/dashboard/my-profile"
          className={`flex flex-col items-center justify-center gap-0.5 ${
            isActive('/dashboard/my-profile') ? 'text-fg' : 'text-subtle'
          }`}
        >
          {user?.image ? (
            <img src={user.image} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <span className="w-5 h-5 rounded-full bg-elevated text-[10px] font-semibold text-fg flex items-center justify-center">
              {profileInitial}
            </span>
          )}
          <span className="text-[10px] font-medium">You</span>
        </Link>
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label, badge, active }) => (
  <Link
    to={to}
    className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${
      active ? 'text-fg' : 'text-subtle hover:text-muted'
    }`}
  >
    <Icon className="text-xl" />
    {badge > 0 && (
      <span className="absolute top-1.5 right-[22%] min-w-[14px] h-3.5 px-1 bg-brand text-brand-fg text-[9px] font-bold rounded-full flex items-center justify-center">
        {badge}
      </span>
    )}
    <span className="text-[10px] font-medium">{label}</span>
  </Link>
);

export default BottomBar;
