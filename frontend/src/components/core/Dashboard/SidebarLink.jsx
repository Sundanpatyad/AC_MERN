import * as Icons from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "../../../slices/courseSlice"
import { setOpenSideMenu } from "../../../slices/sidebarSlice"



export default function SidebarLink({ link, iconName }) {
  const Icon = Icons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()

  const { openSideMenu, screenSize } = useSelector(state => state.sidebar)

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  const handleClick = () => {
    dispatch(resetCourseState())
    if (openSideMenu && screenSize <= 640) dispatch(setOpenSideMenu(false))
  }

  const isActive = matchRoute(link.path)

  return (
    <NavLink
      to={link.path}
      onClick={handleClick}
      className={`relative px-6 py-3 text-sm font-medium transition-all duration-300 group ${isActive
          ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-white border-l-4 border-blue-500"
          : "text-gray-400 hover:text-white hover:bg-zinc-800/50 border-l-4 border-transparent"
        }`}
    >
      <div className="flex items-center gap-x-3">
        <Icon className={`text-xl transition-all duration-300 ${isActive
            ? "text-blue-400"
            : "text-gray-500 group-hover:text-blue-400"
          }`} />
        <span className={`font-medium transition-all duration-300 ${isActive ? "font-semibold" : ""
          }`}>
          {link.name}
        </span>
      </div>

      {/* Active indicator dot */}
      {isActive && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
        </div>
      )}
    </NavLink>
  )
}