import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from "react-router-dom"
import { HiBars2 } from "react-icons/hi2"
import Sidebar from '../components/core/Dashboard/Sidebar'
import Loading from '../components/common/Loading'
import { setOpenSideMenu } from '../slices/sidebarSlice'

const Dashboard = () => {
    const dispatch = useDispatch()
    const { loading: authLoading } = useSelector((state) => state.auth);
    const { loading: profileLoading } = useSelector((state) => state.profile);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    if (profileLoading || authLoading) {
        return (
            <div className='mt-10'>
                <Loading />
            </div>
        )
    }

    return (
        <div className='relative flex min-h-[calc(100vh-4rem)] bg-page'>
            <Sidebar />

            <div className='flex-1 min-w-0'>
                <div className='sm:hidden border-b border-line px-4 py-2.5'>
                    <button
                        onClick={() => dispatch(setOpenSideMenu(true))}
                        className='inline-flex items-center gap-2 text-sm text-muted hover:text-fg transition-colors'
                    >
                        <HiBars2 size={18} />
                        Dashboard menu
                    </button>
                </div>

                <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10'>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
