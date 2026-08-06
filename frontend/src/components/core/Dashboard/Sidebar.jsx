import { useEffect, useState } from "react"
import { VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

import { sidebarLinks } from './../../../../data/dashboard-links';
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from "../../common/ConfirmationModal"
import SidebarLink from "./SidebarLink"
import Loading from './../../common/Loading';
import Img from "../../common/Img"

import { IoClose } from 'react-icons/io5'

import { setOpenSideMenu, setScreenSize } from "../../../slices/sidebarSlice";

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // to keep track of confirmation modal
  const [confirmationModal, setConfirmationModal] = useState(null)

  const { openSideMenu, screenSize } = useSelector((state) => state.sidebar)
  const isMobile = screenSize <= 640
  const isDrawerOpen = openSideMenu && isMobile

  useEffect(() => {
    const handleResize = () => dispatch(setScreenSize(window.innerWidth))

    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // If screen size is small then close the side bar
  useEffect(() => {
    if (screenSize <= 640) {
      dispatch(setOpenSideMenu(false))
    }
    else dispatch(setOpenSideMenu(true))
  }, [screenSize])

  useEffect(() => {
    if (!isDrawerOpen) return
    const onKeyDown = (e) => e.key === 'Escape' && dispatch(setOpenSideMenu(false))
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isDrawerOpen])

  const confirmLogout = () =>
    setConfirmationModal({
      text1: "Are you sure?",
      text2: "You will be logged out of your account.",
      btn1Text: "Log out",
      btn2Text: "Cancel",
      btn1Handler: () => dispatch(logout(navigate)),
      btn2Handler: () => setConfirmationModal(null),
    })

  if (profileLoading || authLoading) {
    return (
      <div className="hidden sm:grid w-[260px] shrink-0 items-center border-r border-line">
        <Loading />
      </div>
    )
  }

  const sidebarContent = (
    <>
      <div className="px-3 pt-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface">
          {user?.image ? (
            <Img
              src={user.image}
              alt={user?.firstName || 'Profile'}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-elevated flex items-center justify-center text-xs font-semibold text-fg shrink-0">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-fg truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-subtle truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {sidebarLinks.map((link) => {
          if (link.type && user?.accountType !== link.type) return null
          return (
            <SidebarLink key={link.id} link={link} iconName={link.icon} />
          )
        })}
      </div>

      <div className="p-3 border-t border-line flex flex-col gap-1">
        <SidebarLink
          link={{ name: "Settings", path: "/dashboard/settings" }}
          iconName={"VscSettingsGear"}
        />

        <button
          onClick={confirmLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand hover:bg-elevated transition-colors text-left"
        >
          <VscSignOut className="text-lg shrink-0" />
          Log out
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside className="hidden sm:flex sticky top-16 h-[calc(100vh-4rem)] w-[260px] shrink-0 flex-col border-r border-line bg-page">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(setOpenSideMenu(false))}
              className="fixed inset-0 bg-[var(--c-overlay)] z-[110] sm:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 w-[min(85%,300px)] bg-page border-r border-line z-[120] flex flex-col sm:hidden"
            >
              <div className="h-16 shrink-0 flex items-center justify-between gap-3 px-5 border-b border-line">
                <span className="text-sm font-semibold text-fg tracking-tight">Dashboard</span>
                <button
                  onClick={() => dispatch(setOpenSideMenu(false))}
                  aria-label="Close dashboard menu"
                  className="p-2 -mr-2 text-fg hover:bg-elevated rounded-full transition-colors"
                >
                  <IoClose size={24} />
                </button>
              </div>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}
