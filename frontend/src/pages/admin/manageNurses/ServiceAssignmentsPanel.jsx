import React from 'react'
import { FiSearch, FiChevronLeft, FiChevronRight, FiPlus, FiX } from 'react-icons/fi'

const ServiceAssignmentsPanel = ({
  assignmentSearchTerm,
  assignmentSearchMode,
  onAssignmentSearchTermChange,
  onAssignmentSearchModeChange,
  onAssignmentSearch,
  assignmentSearchError,
  assignmentSearchLoading,
  assignmentResults,
  onSelectAssignmentNurse,
  selectedNurse,
  assignmentWindow,
  assignmentPagination,
  assignmentError,
  assignmentLoading,
  nurseAssignments,
  activeAssignments,
  onAssignmentPaginate,
  showAssignPanel,
  onOpenAssignPanel,
  onCloseAssignPanel,
  serviceOptions,
  serviceOptionsLoading,
  serviceSearchTerm,
  onServiceSearchTermChange,
  onServiceSearch,
  selectedServiceId,
  onSelectServiceId,
  commissionInput,
  onCommissionInputChange,
  assignPanelFeedback,
  assigningService,
  onAssignService,
  onToggleServiceRelation
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Assigned Services</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nurse Service Access</h1>
        <p className="text-sm text-gray-500">Search a nurse to view, toggle, or assign service slots.</p>
      </header>

      <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              value={assignmentSearchTerm}
              onChange={(e) => onAssignmentSearchTermChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAssignmentSearch()}
              placeholder={assignmentSearchMode === 'name' ? 'Search nurse by name' : 'Enter public ID (e.g. 10233)'}
              className="bg-transparent flex-1 text-sm text-gray-700 focus:outline-none"
            />
          </div>
          <select
            value={assignmentSearchMode}
            onChange={(e) => onAssignmentSearchModeChange(e.target.value)}
            className="lg:w-52 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
          >
            <option value="name">Search by Name</option>
            <option value="publicId">Search by Public ID</option>
          </select>
          <button
            onClick={onAssignmentSearch}
            className="w-full lg:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Locate Nurse
          </button>
        </div>
        {assignmentSearchError && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-600">
            {assignmentSearchError}
          </div>
        )}
        <div className="space-y-3">
          {assignmentSearchLoading && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
              Searching across roster...
            </div>
          )}
          {!assignmentSearchLoading && assignmentResults.length > 0 && (
            <div className="border border-gray-200 rounded-xl divide-y">
              {assignmentResults.map((nurse) => (
                <button
                  key={nurse._id}
                  onClick={() => onSelectAssignmentNurse(nurse)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{nurse.name}</p>
                    <p className="text-xs text-gray-500">ID: SL-N-{nurse.publicId ?? 'NA'}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full border">
                    {nurse.isActive ? 'Active' : 'Disabled'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Assignment Overview</p>
            <h2 className="text-xl font-semibold text-gray-900">{selectedNurse ? selectedNurse.name : 'No nurse selected'}</h2>
            {selectedNurse && (
              <p className="text-sm text-gray-500">ID: SL-N-{selectedNurse.publicId ?? 'NA'} · {selectedNurse.category?.replace(/_/g, ' ') || 'General Duty'}</p>
            )}
          </div>
          {selectedNurse && (
            <div className="flex flex-wrap gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm">
                <span className="block text-xs text-gray-500">Total Services</span>
                <span className="text-lg font-semibold text-gray-900">{assignmentPagination.totalAssignments || 0}</span>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-2 text-sm">
                <span className="block text-xs text-gray-500">Active Services</span>
                <span className="text-lg font-semibold text-teal-700">{activeAssignments}</span>
              </div>
            </div>
          )}
          <button
            onClick={onOpenAssignPanel}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            disabled={!selectedNurse}
          >
            <FiPlus />
            Assign Service
          </button>
        </div>

        {assignmentError && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-600">
            {assignmentError}
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{assignmentWindow}</p>
          {!selectedNurse && (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center">
              <p className="text-gray-600 font-semibold">Search and select a nurse to view assigned services</p>
              <p className="text-sm text-gray-400 mt-1">Use the roster search above to begin.</p>
            </div>
          )}

          {selectedNurse && assignmentLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
          )}

          {selectedNurse && !assignmentLoading && !nurseAssignments.length && (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
              <p className="text-gray-600 font-semibold">No services assigned yet</p>
              <p className="text-sm text-gray-400 mt-1">Use Assign Service to link this nurse to available services.</p>
            </div>
          )}

          {selectedNurse && !assignmentLoading && nurseAssignments.length > 0 && (
            <div className="space-y-4">
              {nurseAssignments.map((relation) => (
                <div
                  key={relation.relationId}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{relation.service?.name || 'Unnamed Service'}</p>
                    <p className="text-sm text-gray-500">
                      {relation.service?.category || 'General'} · ₹{relation.service?.price || 0} · Commission {relation.commissionPercentage || 0}%
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      relation.isActive ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {relation.isActive ? 'Live Assignment' : 'Disabled Service'}
                    </span>
                    <button
                      onClick={() => onToggleServiceRelation(relation.service?._id)}
                      className="text-sm font-semibold text-gray-900 underline"
                    >
                      {relation.isActive ? 'Disable for nurse' : 'Enable for nurse'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedNurse && assignmentPagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => onAssignmentPaginate('prev')}
                disabled={assignmentPagination.currentPage === 1}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                  assignmentPagination.currentPage === 1
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiChevronLeft />
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {assignmentPagination.currentPage} of {assignmentPagination.totalPages || 1}
              </span>
              <button
                onClick={() => onAssignmentPaginate('next')}
                disabled={assignmentPagination.currentPage === assignmentPagination.totalPages}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                  assignmentPagination.currentPage === assignmentPagination.totalPages
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

      {showAssignPanel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 pt-16">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Assign Service</p>
                <h3 className="text-lg font-semibold text-gray-900">{selectedNurse?.name}</h3>
                <p className="text-xs text-gray-500">ID: SL-N-{selectedNurse?.publicId ?? 'NA'}</p>
              </div>
              <button onClick={onCloseAssignPanel} className="p-2 rounded-full hover:bg-gray-100">
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">Search Services</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serviceSearchTerm}
                    onChange={(e) => onServiceSearchTermChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onServiceSearch()}
                    placeholder="Service name, category..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                  <button
                    onClick={onServiceSearch}
                    className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold"
                  >
                    Search
                  </button>
                </div>
                {serviceOptionsLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
                    Loading services...
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">Pick Service</label>
                <div className="border border-gray-200 rounded-xl max-h-56 overflow-y-auto divide-y">
                  {serviceOptions.length === 0 && !serviceOptionsLoading && (
                    <p className="text-sm text-gray-500 p-4 text-center">No services available.</p>
                  )}
                  {serviceOptions.map((service) => (
                    <button
                      type="button"
                      key={service._id}
                      onClick={() => onSelectServiceId(service._id)}
                      className={`w-full text-left px-4 py-3 text-sm ${
                        selectedServiceId === service._id ? 'bg-teal-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.category} · ₹{service.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">Commission %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={commissionInput}
                  onChange={(e) => onCommissionInputChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {assignPanelFeedback.message && (
                <div className={`text-sm px-3 py-2 rounded-lg ${
                  assignPanelFeedback.type === 'success'
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {assignPanelFeedback.message}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onAssignService}
                  disabled={assigningService}
                  className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
                >
                  {assigningService ? 'Assigning...' : 'Confirm Assignment'}
                </button>
                <button
                  onClick={onCloseAssignPanel}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceAssignmentsPanel
