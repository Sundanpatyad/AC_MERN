import { useSelector } from "react-redux"
import { FiEdit2 } from "react-icons/fi"
import { FaCheck } from "react-icons/fa"
import { HiClock } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import { formatDate } from "../../../../services/formatDate"

export default function MockTestsTable({ mockTests, loading }) {
  const navigate = useNavigate()
  const TRUNCATE_LENGTH = 40

  const SkeletonCard = () => {
    return (
      <div className="rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 shadow-2xl">
        <div className="flex flex-col gap-4">
          <div className="h-6 w-3/4 rounded-lg skeleton"></div>
          <div className="h-4 w-full rounded-lg skeleton"></div>
          <div className="h-4 w-5/6 rounded-lg skeleton"></div>
          <div className="flex gap-4 mt-4">
            <div className="h-8 w-32 rounded-lg skeleton"></div>
            <div className="h-8 w-32 rounded-lg skeleton"></div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!loading && mockTests?.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-zinc-800 border border-zinc-700">
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-300 text-xl font-medium">No mock tests found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first mock test series to get started</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {mockTests?.map((series) => (
          <div
            key={series._id}
            className="group rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 shadow-2xl hover:border-zinc-600/50 transition-all duration-300"
          >
            <div className="flex flex-col">
              {/* Header with Title and Status */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-2 capitalize">
                    {series.seriesName}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {series.description?.split(" ").length > TRUNCATE_LENGTH
                      ? series.description.split(" ").slice(0, TRUNCATE_LENGTH).join(" ") + "..."
                      : series.description}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {series.status === 'draft' ? (
                    <div className="flex items-center gap-2 rounded-full bg-yellow-500/20 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-yellow-400 border border-yellow-500/30">
                      <HiClock size={14} />
                      Draft
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-full bg-green-500/20 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-green-400 border border-green-500/30">
                      <FaCheck size={12} />
                      Published
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Tests</p>
                    <p className="text-gray-300 font-semibold">{series.mockTests?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-lg bg-green-500/10">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-gray-300 font-semibold">₹{series.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm col-span-2 sm:col-span-1">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Students</p>
                    <p className="text-gray-300 font-semibold">{series.studentsEnrolled?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-zinc-700/50">
                <div className="flex items-center gap-1.5">
                  <span>Created:</span>
                  <span className="text-gray-400">{formatDate(series?.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Updated:</span>
                  <span className="text-gray-400">{formatDate(series?.updatedAt)}</span>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  disabled={loading}
                  onClick={() => navigate(`/dashboard/edit-mock-test-series/${series._id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiEdit2 size={18} />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
