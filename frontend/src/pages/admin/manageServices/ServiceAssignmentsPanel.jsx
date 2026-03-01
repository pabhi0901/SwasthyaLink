import React, { useMemo } from 'react'
import { FiArrowLeft, FiRefreshCcw } from 'react-icons/fi'
import ServiceAssignmentCard from './ServiceAssignmentCard'
import ServiceSelectorList from './ServiceSelectorList'

const ServiceAssignmentsPanel = ({
  services,
  servicesLoading,
  servicesError,
  servicePagination,
  serviceSearchTerm,
  onServiceSearchChange,
  onServiceSearch,
  onServiceSearchReset,
  onServicesPaginate,
  serviceId,
  serviceInfo,
  assignments,
  loading,
  error,
  pagination,
  feedback,
  onServiceChange,
  onPaginate,
  onToggleAssignment,
  togglingRelationId,
  onRefresh,
  onSelectService,
  serviceSummary
}) => {
  const selectedService = useMemo(
    () => services?.find((service) => service._id === serviceId),
    [services, serviceId]
  )

  const stats = useMemo(() => {
    const total = assignments?.length || 0
    const active = assignments?.filter((assignment) => assignment.isActive)?.length || 0
    return {
      total,
      active,
      inactive: total - active
    }
  }, [assignments])

  const currentPage = pagination?.currentPage || 1
  const totalPages = pagination?.totalPages || 1
  const totalRecords = pagination?.totalRecords || stats.total

  // Show service selector if no service is selected
  if (!serviceId) {
    return (
      <ServiceSelectorList
        services={services}
        servicesLoading={servicesLoading}
        servicesError={servicesError}
        pagination={servicePagination}
        searchTerm={serviceSearchTerm}
        onSearchTermChange={onServiceSearchChange}
        onSearch={onServiceSearch}
        onResetSearch={onServiceSearchReset}
        onPaginate={onServicesPaginate}
        onSelectService={onServiceChange}
        selectedServiceId={serviceId}
        summary={serviceSummary}
      />
    )
  }

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <button
              type="button"
              onClick={() => onServiceChange(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 mb-3"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to service list
            </button>
            <h2 className="text-xl font-semibold text-gray-900">{serviceInfo?.name || selectedService?.name || 'Service'}</h2>
            <p className="text-sm text-gray-500 capitalize">{serviceInfo?.category?.replace(/-/g, ' ') || selectedService?.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCcw className="w-4 h-4" />
              Refresh
            </button>
            {selectedService && (
              <button
                type="button"
                onClick={() => onSelectService?.(selectedService)}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                Open details
              </button>
            )}
          </div>
        </div>
      </div>

      {feedback?.message && (
        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-rose-50 text-rose-600 border-rose-100'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-gray-500">Total assignments</p>
              <p className="text-lg font-semibold text-gray-900">{totalRecords}</p>
            </div>
            <div>
              <p className="text-gray-500">Active</p>
              <p className="text-lg font-semibold text-emerald-600">{stats.active}</p>
            </div>
            <div>
              <p className="text-gray-500">Inactive</p>
              <p className="text-lg font-semibold text-rose-500">{stats.inactive}</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`assignment-skeleton-${index}`} className="h-32 bg-white border border-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-sm text-rose-600">
            {error}
          </div>
        )}

        {!loading && !error && !assignments?.length && (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500 text-sm">
            No nurses assigned to this service yet.
          </div>
        )}

        {!loading && !error && !!assignments?.length && (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <ServiceAssignmentCard
                key={assignment.relationId}
                assignment={assignment}
                onToggle={(nurseId, serviceIdValue, relationId) =>
                  onToggleAssignment(nurseId, serviceIdValue || serviceId, relationId)
                }
                togglingRelationId={togglingRelationId}
              />
            ))}
          </div>
        )}

        {assignments?.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onPaginate('prev')}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => onPaginate('next')}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ServiceAssignmentsPanel
