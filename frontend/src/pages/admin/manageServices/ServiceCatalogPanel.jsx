import React from 'react'
import { FiRefreshCcw, FiSearch } from 'react-icons/fi'
import ServiceListItem from './ServiceListItem'

const ServiceCatalogPanel = ({
  services,
  servicesLoading,
  servicesError,
  pagination,
  searchTerm,
  onSearchTermChange,
  onSearch,
  onResetSearch,
  onPaginate,
  onSelectService,
  selectedServiceId,
  onToggleServiceStatus,
  togglingServiceId,
  summary
}) => {
  const renderContent = () => {
    if (servicesLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`service-skeleton-${index}`} className="animate-pulse bg-white border border-gray-100 rounded-xl p-5">
              <div className="h-5 w-2/3 bg-gray-200 rounded" />
              <div className="mt-3 h-4 w-1/2 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )
    }

    if (servicesError) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 text-sm">
          {servicesError}
        </div>
      )
    }

    if (!services.length) {
      return (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
          No services match the current filters.
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {services.map((service) => (
          <ServiceListItem
            key={service._id}
            service={service}
            isSelected={selectedServiceId === service._id}
            onSelect={() => onSelectService(service)}
            onToggleStatus={onToggleServiceStatus}
            togglingServiceId={togglingServiceId}
          />
        ))}
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-sm text-gray-500">Total Services</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.total}</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-gray-500">Active</p>
              <p className="text-lg font-semibold text-emerald-600">{summary.active}</p>
            </div>
            <div>
              <p className="text-gray-500">Inactive</p>
              <p className="text-lg font-semibold text-rose-500">{summary.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Search Services</span>
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                placeholder="Search by name, category, or description"
                className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSearch}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Apply
            </button>
            <button
              onClick={onResetSearch}
              className="px-3 py-2 text-sm font-semibold text-gray-600 flex items-center gap-1 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <FiRefreshCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {renderContent()}

      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          Page {pagination.currentPage} of {pagination.totalPages}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPaginate('prev')}
            disabled={pagination.currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPaginate('next')}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export default ServiceCatalogPanel
