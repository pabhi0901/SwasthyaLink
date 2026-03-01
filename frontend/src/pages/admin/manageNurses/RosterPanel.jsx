import React from 'react'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const RosterPanel = ({
  statusCounts,
  statusLoading,
  statusError,
  rosterLeaveDate,
  onRosterLeaveDateChange,
  rosterLeaveCount,
  rosterLeaveLoading,
  rosterLeaveError,
  searchTerm,
  onSearchTermChange,
  searchMode,
  onSearchModeChange,
  onSearch,
  pageWindow,
  nurses,
  pagination,
  onPaginate,
  loading,
  error,
  onToggleNurseAccess,
  togglingNurseId,
  onAddNurse
}) => {
  const renderAvatar = (nurse) => {
    if (nurse.image) {
      return (
        <img
          src={nurse.image}
          alt={nurse.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-teal-100"
        />
      )
    }

    const initials = nurse.name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return (
      <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-semibold">
        {initials || 'NU'}
      </div>
    )
  }

  const NurseList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm font-medium">
          {error}
        </div>
      )
    }

    if (!nurses.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600 font-medium">No nurses match the current filters</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting the search criteria</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {nurses.map((nurse) => (
          <div
            key={nurse._id}
            className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {renderAvatar(nurse)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{nurse.name}</h3>
                  <p className="text-sm text-teal-600 font-medium">ID: SL-N-{nurse.publicId ?? 'NA'}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    nurse.isActive
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : 'bg-rose-50 text-rose-600 border-rose-200'
                  }`}
                >
                  {nurse.isActive ? 'Active' : 'Access Disabled'}
                </span>
                <button
                  onClick={() => onToggleNurseAccess?.(nurse._id)}
                  disabled={togglingNurseId === nurse._id}
                  className="text-xs font-semibold text-gray-900 underline disabled:opacity-60"
                >
                  {togglingNurseId === nurse._id
                    ? 'Updating...'
                    : nurse.isActive ? 'Set inactive' : 'Set active'}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M8 5v14m8-14v14M5 19h14" />
                </svg>
                <span>{nurse.phone || 'Phone unavailable'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{nurse.category?.replace(/_/g, ' ') || 'General Duty'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">All Nurses</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Roster Overview</h1>
          </div>
          <button
            onClick={onAddNurse}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold"
          >
            Add new nurse
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase">Active</p>
            <p className="text-2xl font-semibold text-teal-600">
              {statusLoading ? '...' : statusCounts.active}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase">Inactive</p>
            <p className="text-2xl font-semibold text-rose-500">
              {statusLoading ? '...' : statusCounts.inactive}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-gray-500 uppercase">On leave</p>
                <p className="text-2xl font-semibold text-amber-600">
                  {rosterLeaveLoading ? '...' : rosterLeaveCount}
                </p>
              </div>
              <input
                type="date"
                value={rosterLeaveDate}
                onChange={(e) => onRosterLeaveDateChange?.(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700"
              />
            </div>
            {rosterLeaveError && (
              <p className="text-xs text-rose-500 mt-2">{rosterLeaveError}</p>
            )}
          </div>
        </div>
        {statusError && <p className="text-xs text-rose-500">{statusError}</p>}
      </header>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder={searchMode === 'name' ? 'Search nurse by name' : 'Enter public ID (e.g. 10233)'}
              className="bg-transparent flex-1 text-sm text-gray-700 focus:outline-none"
            />
          </div>
          <select
            value={searchMode}
            onChange={(e) => onSearchModeChange(e.target.value)}
            className="sm:w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
          >
            <option value="name">Search by Name</option>
            <option value="publicId">Search by Public ID</option>
          </select>
          <button
            onClick={onSearch}
            className="w-full sm:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Search
          </button>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{pageWindow}</p>
      </div>

      <NurseList />

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => onPaginate('prev')}
          disabled={pagination.currentPage === 1}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
            pagination.currentPage === 1
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
          disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
            pagination.currentPage === pagination.totalPages || pagination.totalPages === 0
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
          <FiChevronRight />
        </button>
      </div>
    </div>
  )
}

export default RosterPanel
