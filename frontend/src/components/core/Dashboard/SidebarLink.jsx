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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
        isActive
          ? "bg-elevated text-fg font-medium"
          : "text-muted hover:text-fg hover:bg-elevated"
      }`}
    >
      {Icon && <Icon className="text-lg shrink-0" />}
      <span className="truncate">{link.name}</span>
    </NavLink>
  )
}
