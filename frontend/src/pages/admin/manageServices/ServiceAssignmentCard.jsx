import React from 'react'
import { FiMail, FiPhone, FiClock, FiCalendar } from 'react-icons/fi'

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatMinutesToTime = (minutes) => {
  if (typeof minutes !== 'number' || minutes < 0) return '—'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(mins).padStart(2, '0')} ${period}`
}

const getDayNames = (dayNumbers) => {
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  if (!Array.isArray(dayNumbers) || dayNumbers.length === 0) return 'None'
  return dayNumbers.map((num) => dayMap[num] || '?').join(', ')
}

const ServiceAssignmentCard = ({ assignment, onToggle, togglingRelationId }) => {
  if (!assignment) return null

  const nurse = assignment.nurse || {}
  const initials = nurse.name ? nurse.name.slice(0, 2).toUpperCase() : 'NR'
  const actionLabel = assignment.isActive ? 'Disable assignment' : 'Activate assignment'
  const badgeClasses = assignment.isActive
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-rose-50 text-rose-600 border-rose-200'

  return (
    <article
      className={`bg-white border rounded-2xl p-5 shadow-sm transition ${
        assignment.isActive ? 'border-gray-100' : 'border-rose-100 bg-rose-50/40'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          {nurse.image ? (
            <img src={nurse.image} alt={nurse.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-semibold flex items-center justify-center">
              {initials}
            </div>
          )}
          <div>
            <p className="text-base font-semibold text-gray-900">{nurse.name || 'Nurse removed'}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
              {nurse.email && (
                <span className="inline-flex items-center gap-1">
                  <FiMail className="w-4 h-4" />
                  {nurse.email}
                </span>
              )}
              {nurse.phone && (
                <span className="inline-flex items-center gap-1">
                  <FiPhone className="w-4 h-4" />
                  {nurse.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeClasses}`}>
          {assignment.isActive ? 'Assignment active' : 'Assignment disabled'}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-xs text-gray-500">Commission</p>
          <p className="font-semibold">{assignment.commissionPercentage || 0}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Assigned on</p>
          <p className="font-semibold">{formatDate(assignment.assignedAt)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Nurse account</p>
          <p className="font-semibold">{nurse.isActive ? 'Active' : 'Disabled'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 inline-flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            Work hours
          </p>
          <p className="font-semibold">
            {assignment.availability
              ? `${formatMinutesToTime(assignment.availability.startMinutes)} - ${formatMinutesToTime(assignment.availability.endMinutes)}`
              : 'Not set'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 inline-flex items-center gap-1">
            <FiCalendar className="w-3 h-3" />
            Weekly off
          </p>
          <p className="font-semibold">
            {assignment.availability
              ? getDayNames(assignment.availability.weeklyOffDays)
              : 'Not set'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          Last updated {formatDate(assignment.updatedAt)}
        </p>
        <button
          type="button"
          onClick={() => {
            if (!nurse._id) return
            onToggle(nurse._id, assignment.serviceId, assignment.relationId)
          }}
          disabled={togglingRelationId === assignment.relationId || !nurse._id}
          className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors flex items-center justify-center gap-2 ${
            assignment.isActive
              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
          } ${togglingRelationId === assignment.relationId || !nurse._id ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {actionLabel}
        </button>
      </div>
    </article>
  )
}

export default ServiceAssignmentCard
