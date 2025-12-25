import { useEffect, useState } from "react"
import { VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { sidebarLinks } from './../../../../data/dashboard-links';
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from "../../common/ConfirmationModal"
import SidebarLink from "./SidebarLink"
import Loading from './../../common/Loading';

import { HiBars2 } from "react-icons/hi2";
import { IoMdClose } from 'react-icons/io'

import { setOpenSideMenu, setScreenSize } from "../../../slices/sidebarSlice";




export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // to keep track of confirmation modal
  const [confirmationModal, setConfirmationModal] = useState(null)

  const { openSideMenu, screenSize } = useSelector((state) => state.sidebar)

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



  if (profileLoading || authLoading) {
    return (
      <div className="grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r border-zinc-800 bg-gradient-to-b from-zinc-900 to-black">
        <Loading />
      </div>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="sm:hidden fixed left-4 top-4 z-50 p-2 rounded-lg bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 text-white hover:bg-zinc-700 transition-all duration-200 shadow-lg"
        onClick={() => dispatch(setOpenSideMenu(!openSideMenu))}
      >
        {openSideMenu ? <IoMdClose size={24} /> : <HiBars2 size={24} />}
      </button>

      {/* Mobile Overlay */}
      {openSideMenu && screenSize <= 640 && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 sm:hidden"
          onClick={() => dispatch(setOpenSideMenu(false))}
        />
      )}

      {/* Sidebar */}
      {openSideMenu && (
        <div className={`
          flex h-[calc(100vh-3.5rem)] min-w-[260px] flex-col 
          border-r border-zinc-800 
          bg-gradient-to-b from-zinc-900 via-zinc-900 to-black 
          py-6
          ${screenSize <= 640 ? 'fixed left-0 top-14 z-40 shadow-2xl' : 'relative'}
        `}>
          {/* User Info Section */}
          <div className="px-6 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {sidebarLinks.map((link) => {
              if (link.type && user?.accountType !== link.type) return null
              return (
                <SidebarLink key={link.id} link={link} iconName={link.icon} setOpenSideMenu={setOpenSideMenu} />
              )
            })}
          </div>

          {/* Separator with gradient */}
          <div className="mx-6 my-4 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

          {/* Bottom Section */}
          <div className="flex flex-col px-2">
            <SidebarLink
              link={{ name: "Settings", path: "/dashboard/settings" }}
              iconName={"VscSettingsGear"}
              setOpenSideMen={setOpenSideMenu}
            />

            <button
              onClick={() =>
                setConfirmationModal({
                  text1: "Are you sure?",
                  text2: "You will be logged out of your account.",
                  btn1Text: "Logout",
                  btn2Text: "Cancel",
                  btn1Handler: () => dispatch(logout(navigate)),
                  btn2Handler: () => setConfirmationModal(null),
                })
              }
              className="group relative px-6 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-red-500/10 transition-all duration-300 border-l-4 border-transparent hover:border-red-500"
            >
              <div className="flex items-center gap-x-3">
                <VscSignOut className="text-xl text-gray-500 group-hover:text-red-400 transition-all duration-300" />
                <span className="font-medium">Logout</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}