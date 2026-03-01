import React from 'react'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const LeaveRequestsPanel = ({
  leaveSearchTerm,
  leaveSearchMode,
  onLeaveSearchTermChange,
  onLeaveSearchModeChange,
  onLeaveSearch,
  leaveSearchFeedback,
  leavePagination,
  leaveError,
  leaveLoading,
  leaveRequests,
  onLeaveReset,
  onLeavePagination,
  leaveActionTarget,
  onActOnLeaveRequest
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Leave Requests</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pending Leave Queue</h1>
        <p className="text-sm text-gray-500">Review outstanding leave applications and respond in one place.</p>
      </header>

      <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              value={leaveSearchTerm}
              onChange={(e) => onLeaveSearchTermChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onLeaveSearch()}
              placeholder={leaveSearchMode === 'name' ? 'Search by nurse name' : 'Enter public ID (e.g. 10233)'}
              className="bg-transparent flex-1 text-sm text-gray-700 focus:outline-none"
            />
          </div>
          <select
            value={leaveSearchMode}
            onChange={(e) => onLeaveSearchModeChange(e.target.value)}
            className="lg:w-52 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
          >
            <option value="name">Search by Name</option>
            <option value="publicId">Search by Public ID</option>
          </select>
          <button
            onClick={onLeaveSearch}
            className="w-full lg:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Search Requests
          </button>
        </div>
        {leaveSearchFeedback && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            {leaveSearchFeedback}
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Pending Review</p>
            <h2 className="text-xl font-semibold text-gray-900">{leavePagination.totalLeaves || 0} requests</h2>
            <p className="text-sm text-gray-500">Oldest applications appear first. Approve or reject instantly.</p>
          </div>
          <button
            onClick={onLeaveReset}
            className="text-sm font-semibold text-gray-900 underline"
          >
            Reset filters
          </button>
        </div>

        {leaveError && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-600">
            {leaveError}
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 space-y-4">
          {leaveLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center">
              <p className="text-gray-600 font-semibold">No pending leave applications</p>
              <p className="text-sm text-gray-400 mt-1">Approved or rejected requests will drop off automatically.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((leave) => (
                <div
                  key={leave._id}
                  className="border border-gray-200 rounded-xl p-4 space-y-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{leave.nurseName}</p>
                      <p className="text-sm text-gray-500">ID: SL-N-{leave.nursePublicId ?? 'NA'}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                      Awaiting decision
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3 text-sm text-gray-600">
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <p className="text-xs uppercase text-gray-400">Duration</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <p className="text-xs uppercase text-gray-400">Requested on</p>
                      <p className="text-sm font-semibold text-gray-900">{new Date(leave.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <p className="text-xs uppercase text-gray-400">Reason</p>
                      <p className="text-sm text-gray-700">{leave.reason || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">What’s next?</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => onActOnLeaveRequest(leave._id, 'APPROVED')}
                        disabled={leaveActionTarget === `${leave._id}-APPROVED`}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-teal-600 text-white disabled:opacity-60"
                      >
                        {leaveActionTarget === `${leave._id}-APPROVED` ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => onActOnLeaveRequest(leave._id, 'REJECTED')}
                        disabled={leaveActionTarget === `${leave._id}-REJECTED`}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white disabled:opacity-60"
                      >
                        {leaveActionTarget === `${leave._id}-REJECTED` ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {leaveRequests.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => onLeavePagination('prev')}
                disabled={leavePagination.currentPage === 1}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                  leavePagination.currentPage === 1
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiChevronLeft />
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {leavePagination.currentPage} of {leavePagination.totalPages || 1}
              </span>
              <button
                onClick={() => onLeavePagination('next')}
                disabled={leavePagination.currentPage === leavePagination.totalPages}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                  leavePagination.currentPage === leavePagination.totalPages
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default LeaveRequestsPanel
