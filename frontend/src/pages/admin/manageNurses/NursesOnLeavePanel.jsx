import React from 'react'
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const NursesOnLeavePanel = ({
  selectedDate,
  onDateChange,
  onFetch,
  loading,
  error,
  nursesOnLeave,
  pagination,
  onPaginate,
  lastFetchedDate
}) => {
  const formattedDate = lastFetchedDate || selectedDate

  const formatDate = (value) => {
    if (!value) return '—'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return '—'
    }
    return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Nurses On Leave</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Leave Snapshot</h1>
        <p className="text-sm text-gray-500">Pick a date to see who will be away so you can rebalance duty rosters quickly.</p>
      </header>

      <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              Review date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={onFetch}
            className="w-full lg:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Show leave roster
          </button>
        </div>
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-600">
            {error}
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Overview</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{formattedDate ? formatDate(formattedDate) : 'Select a date'}</h2>
              <p className="text-sm text-gray-500">{pagination.totalNursesOnLeave || 0} nurses marked on approved leave</p>
            </div>
            {lastFetchedDate && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-600">
                Last pulled for {formatDate(lastFetchedDate)}
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
          ) : nursesOnLeave.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center">
              <p className="text-gray-600 font-semibold">No nurses on leave for this date.</p>
              <p className="text-sm text-gray-400 mt-1">Select a different day if you expect staffing gaps.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nursesOnLeave.map((leave) => (
                <div key={leave._id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{leave.nurseName}</p>
                      <p className="text-sm text-gray-500">ID: SL-N-{leave.nursePublicId ?? 'NA'}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                      Approved leave
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-gray-600">
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <p className="text-xs uppercase text-gray-400">Leave window</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(leave.startDate)} — {formatDate(leave.endDate)}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <p className="text-xs uppercase text-gray-400">Reason</p>
                      <p className="text-sm text-gray-700">{leave.reason || 'Not specified'}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <p className="text-xs uppercase text-gray-400">Requested on</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(leave.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {nursesOnLeave.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => onPaginate('prev')}
                disabled={pagination.currentPage === 1 || loading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                  pagination.currentPage === 1 || loading
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiChevronLeft />
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages || 1}
              </span>
              <button
                onClick={() => onPaginate('next')}
                disabled={pagination.currentPage === pagination.totalPages || loading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                  pagination.currentPage === pagination.totalPages || loading
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

export default NursesOnLeavePanel
