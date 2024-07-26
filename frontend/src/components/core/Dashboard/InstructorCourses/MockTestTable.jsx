import { useSelector } from "react-redux"
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'
import { useState } from "react"
import { FiEdit2 } from "react-icons/fi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useNavigate } from "react-router-dom"
import { formatDate } from "../../../../services/formatDate"

import ConfirmationModal from "../../../common/ConfirmationModal"
import toast from 'react-hot-toast'
import { fetchInstructorMockTest } from "../../../../services/operations/mocktest"

export default function MockTestsTable({ mockTests, setMockTests, loading, setLoading }) {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [confirmationModal, setConfirmationModal] = useState(null)

  const handleMockTestDelete = async (mockTestId) => {
    setLoading(true)
    const toastId = toast.loading('Deleting...')
    try {
      await deleteMockTest({ mockTestId: mockTestId }, token)
      const result = await fetchInstructorMockTest(token)
      if (result) {
        setMockTests(result)
      }
      toast.success("Mock test deleted successfully")
    } catch (error) {
      toast.error("Failed to delete mock test")
    }
    setConfirmationModal(null)
    setLoading(false)
    toast.dismiss(toastId)
  }

  const skItem = () => {
    return (
      <div className="flex border-b border-richblack-800 px-6 py-8 w-full">
        <div className="flex flex-1 gap-x-4">
          <div className='h-[148px] min-w-[300px] rounded-xl skeleton'></div>
          <div className="flex flex-col w-[40%]">
            <p className="h-5 w-[50%] rounded-xl skeleton"></p>
            <p className="h-20 w-[60%] rounded-xl mt-3 skeleton"></p>
            <p className="h-2 w-[20%] rounded-xl skeleton mt-3"></p>
            <p className="h-2 w-[20%] rounded-xl skeleton mt-2"></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Table className="rounded-2xl border border-richblack-800">
        <Thead>
          <Tr className="flex gap-x-10 rounded-t-3xl border-b border-b-richblack-800 px-6 py-2">
            <Th className="flex-1 text-left text-sm font-medium uppercase text-richblack-100">
              Series Name
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Description
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Total Tests
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Price
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Status
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Actions
            </Th>
          </Tr>
        </Thead>

        {loading && (
          <Tbody>
            {skItem()}{skItem()}{skItem()}
          </Tbody>
        )}

        <Tbody>
          {!loading && mockTests?.length === 0 ? (
            <Tr>
              <Td className="py-10 text-center text-2xl font-medium text-richblack-100">
                No mock tests found
              </Td>
            </Tr>
          ) : (
            mockTests?.map((series) => (
              <Tr
                key={series._id}
                className="flex gap-x-10 border-b border-richblack-800 px-6 py-8"
              >
                <Td className="flex flex-1 gap-x-4 relative">
                  <div className="flex flex-col">
                    <p className="text-lg font-semibold text-richblack-5 capitalize">{series.seriesName}</p>
                    <p className="text-sm text-richblack-100 mt-2">{series.description}</p>
                    <p className="text-[12px] text-richblack-100 mt-4">
                      Created: {formatDate(series?.createdAt)}
                    </p>
                    <p className="text-[12px] text-richblack-100">
                      Updated: {formatDate(series?.updatedAt)}
                    </p>
                  </div>
                </Td>
                <Td className="text-sm font-medium text-richblack-100">{series.totalTests}</Td>
                <Td className="text-sm font-medium text-richblack-100">{series.price}</Td>
                <Td className="text-sm font-medium text-richblack-100">{series.status}</Td>
                <Td className="text-sm font-medium text-richblack-100">
                  <button
                    disabled={loading}
                    onClick={() => { navigate(`/dashboard/edit-mock-test-series/${series._id}`) }}
                    title="Edit"
                    className="px-2 transition-all duration-200 hover:scale-110 hover:text-caribbeangreen-300"
                  >
                    <FiEdit2 size={20} />
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => {
                      setConfirmationModal({
                        text1: "Do you want to delete this mock test series?",
                        text2: "All the data related to this mock test series will be deleted",
                        btn1Text: !loading ? "Delete" : "Loading...",
                        btn2Text: "Cancel",
                        btn1Handler: !loading
                          ? () => handleMockTestDelete(series._id)
                          : () => { },
                        btn2Handler: !loading
                          ? () => setConfirmationModal(null)
                          : () => { },
                      })
                    }}
                    title="Delete"
                    className="px-1 transition-all duration-200 hover:scale-110 hover:text-[#ff0000]"
                  >
                    <RiDeleteBin6Line size={20} />
                  </button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}
