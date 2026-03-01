import React from 'react'
import { FiClock, FiEdit3, FiTag } from 'react-icons/fi'

const ServiceListItem = ({ service, isSelected, onSelect, onToggleStatus, togglingServiceId }) => {
  const heroImage = service.images?.[0]?.url
  const serviceStatus = service.isActive ? 'Active' : 'Inactive'
  const statusClasses = service.isActive
    ? 'text-emerald-700 bg-emerald-50'
    : 'text-rose-600 bg-rose-50'

  return (
    <article
      onClick={onSelect}
      className={`bg-white border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center ${
        isSelected ? 'border-indigo-400 shadow-sm' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        {heroImage ? (
          <img
            src={heroImage}
            alt={service.name}
            className="w-16 h-16 rounded-xl object-cover border border-gray-100"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-semibold">
            {service.name?.slice(0, 2)?.toUpperCase() || 'SL'}
          </div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-semibold text-gray-900">{service.name}</h3>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClasses}`}>
              {serviceStatus}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 capitalize">{service.category?.replace(/-/g, ' ')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              {service.sessionDuration ? `${service.sessionDuration} mins` : 'Duration N/A'}
            </span>
            <span className="flex items-center gap-1">
              <FiTag className="w-4 h-4" />
              ₹{service.price ?? '—'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-2 text-sm font-medium">
        <button
          onClick={(event) => {
            event.stopPropagation()
            onToggleStatus(service._id)
          }}
          disabled={togglingServiceId === service._id}
          className={`px-4 py-2 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 ${
            service.isActive
              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
          } ${togglingServiceId === service._id ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <FiEdit3 className="w-4 h-4" />
          {service.isActive ? 'Disable' : 'Activate'}
        </button>
        <span className="text-xs text-center text-gray-400">Select to edit details</span>
      </div>
    </article>
  )
}

export default ServiceListItem
