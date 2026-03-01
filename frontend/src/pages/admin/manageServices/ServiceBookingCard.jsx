import React from 'react'
import { FiCalendar, FiClock, FiMapPin, FiUser } from 'react-icons/fi'

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (minutes) => {
  if (minutes === undefined || minutes === null) return '--:--'
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

const ServiceBookingCard = ({ booking }) => {
  if (!booking) return null

  const patient = booking.userId || {}
  const nurse = booking.nurseId || {}
  const address = booking.address || {}
  const location = [address.flatNumber, address.locality, address.city].filter(Boolean).join(', ')
  const timeRange = `${formatTime(booking.startMinutes)} - ${formatTime(booking.endMinutes)}`

  return (
    <article className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Booked by</p>
          <p className="text-base font-semibold text-gray-900">{patient.name || 'Customer deleted'}</p>
          <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
            <FiUser className="w-4 h-4" />
            Nurse: <span className="font-semibold text-gray-800">{nurse.name || 'Unassigned'}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total amount</p>
          <p className="text-xl font-semibold text-indigo-600">₹{(booking.totalPrice || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(booking.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiClock className="w-4 h-4 text-gray-400" />
          <span>{timeRange}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiMapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate" title={location}>
            {location || address.state || 'Address unavailable'}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <span>Status: <span className="font-semibold text-emerald-600">{booking.status}</span></span>
        <span>Created {formatDate(booking.createdAt)}</span>
      </div>
    </article>
  )
}

export default ServiceBookingCard
