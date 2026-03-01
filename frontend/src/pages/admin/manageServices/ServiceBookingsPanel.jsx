import React, { useMemo } from 'react'
import { FiRefreshCcw, FiArrowLeft } from 'react-icons/fi'
import ServiceBookingCard from './ServiceBookingCard'
import ServiceSelectorList from './ServiceSelectorList'

const ServiceBookingsPanel = ({
  services,
  servicesLoading,
  servicesError,
  servicePagination,
  serviceSearchTerm,
  onServiceSearchChange,
  onServiceSearch,
  onServiceSearchReset,
  serviceSummary,
  serviceId,
  selectedService,
  serviceInfo,
  bookings,
  loading,
  error,
  pagination,
  onServiceChange,
  onPaginate,
  onServicesPaginate,
  onRefresh,
  onSelectService
}) => {
  const currentPage = pagination?.currentPage || 1
  const totalPages = pagination?.totalPages || 1
  const totalRecords = pagination?.totalRecords || bookings?.length || 0
  const pageRevenue = bookings?.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0) || 0

  if (!serviceId) {
    return (
      <section className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Confirmed Bookings by Service</h2>
          <p className="text-sm text-gray-500">Select a service to view its confirmed bookings.</p>
        </div>
        <ServiceSelectorList
          services={services}
          servicesLoading={servicesLoading}
          servicesError={servicesError}
          pagination={servicePagination}
          searchTerm={serviceSearchTerm}
          onSearchTermChange={onServiceSearchChange}
          onSearch={onServiceSearch}
          onResetSearch={onServiceSearchReset}
          summary={serviceSummary}
          selectedServiceId={serviceId}
          onPaginate={onServicesPaginate}
          onSelectService={onServiceChange}
        />
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onServiceChange(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{serviceInfo?.name || selectedService?.name || 'Service bookings'}</h2>
            <p className="text-sm text-gray-500 capitalize">{serviceInfo?.category?.replace(/-/g, ' ') || selectedService?.category}</p>
          </div>
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

      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-gray-500">Confirmed bookings</p>
              <p className="text-lg font-semibold text-gray-900">{totalRecords}</p>
            </div>
            <div>
              <p className="text-gray-500">this service revenue</p>
              <p className="text-lg font-semibold text-indigo-600">₹{pageRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`booking-skeleton-${index}`} className="h-32 bg-white border border-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-sm text-rose-600">
            {error}
          </div>
        )}

        {!loading && !error && !bookings?.length && (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500 text-sm">
            No confirmed bookings recorded for this service yet.
          </div>
        )}

        {!loading && !error && !!bookings?.length && (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <ServiceBookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}

        {bookings?.length > 0 && (
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

export default ServiceBookingsPanel
