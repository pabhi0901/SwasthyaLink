import React from 'react'
import { FiSearch } from 'react-icons/fi'

const WEEK_DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 }
]

const AvailabilityPanel = ({
  availabilitySearchTerm,
  availabilitySearchMode,
  onAvailabilitySearchTermChange,
  onAvailabilitySearchModeChange,
  onAvailabilitySearch,
  availabilitySearchError,
  availabilitySearchLoading,
  availabilityResults,
  onSelectAvailabilityNurse,
  availabilitySelectedNurse,
  availabilityDetailLoading,
  availabilityData,
  shiftForm,
  onShiftTimeChange,
  onToggleWeeklyOffDay,
  onSaveShift,
  savingShift,
  availabilityFeedback
}) => {
  const formatShiftSummary = () => {
    if (availabilityDetailLoading) {
      return 'Loading current shift...'
    }
    if (!availabilitySelectedNurse) {
      return 'Select a nurse to review allotted hours.'
    }
    if (!availabilityData) {
      return 'No time shift assigned yet.'
    }
    return `Active on ${formatMinutes(availabilityData.startMinutes)} - ${formatMinutes(availabilityData.endMinutes)}`
  }

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const suffix = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 === 0 ? 12 : hours % 12
    return `${hour12}:${String(mins).padStart(2, '0')} ${suffix}`
  }

  const renderWeeklyOff = () => {
    const current = availabilityData?.weeklyOffDays ?? shiftForm.weeklyOffDays
    if (!current || !current.length) {
      return 'No weekly offs configured'
    }
    return current
      .map((day) => WEEK_DAYS.find((item) => item.value === day)?.label || day)
      .join(', ')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Availability</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Time Shift Planner</h1>
        <p className="text-sm text-gray-500">Review and edit nurse duty hours & weekly offs from a single console.</p>
      </header>

      <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              value={availabilitySearchTerm}
              onChange={(e) => onAvailabilitySearchTermChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAvailabilitySearch()}
              placeholder={availabilitySearchMode === 'name' ? 'Search nurse by name' : 'Enter public ID (e.g. 10233)'}
              className="bg-transparent flex-1 text-sm text-gray-700 focus:outline-none"
            />
          </div>
          <select
            value={availabilitySearchMode}
            onChange={(e) => onAvailabilitySearchModeChange(e.target.value)}
            className="lg:w-52 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
          >
            <option value="name">Search by Name</option>
            <option value="publicId">Search by Public ID</option>
          </select>
          <button
            onClick={onAvailabilitySearch}
            className="w-full lg:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Find Nurse
          </button>
        </div>
        {availabilitySearchError && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-600">
            {availabilitySearchError}
          </div>
        )}
        <div className="space-y-3">
          {availabilitySearchLoading && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
              Searching roster...
            </div>
          )}
          {!availabilitySearchLoading && availabilityResults.length > 0 && (
            <div className="border border-gray-200 rounded-xl divide-y">
              {availabilityResults.map((nurse) => (
                <button
                  key={nurse._id}
                  onClick={() => onSelectAvailabilityNurse(nurse)}
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
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Selected Nurse</p>
          <h2 className="text-xl font-semibold text-gray-900">
            {availabilitySelectedNurse ? availabilitySelectedNurse.name : 'No nurse selected'}
          </h2>
          {availabilitySelectedNurse && (
            <p className="text-sm text-gray-500">
              ID: SL-N-{availabilitySelectedNurse.publicId ?? 'NA'} · {availabilitySelectedNurse.category?.replace(/_/g, ' ') || 'General Duty'}
            </p>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-1">
          <p className="text-xs uppercase text-gray-400">Current Plan</p>
          <p className="text-sm font-semibold text-gray-900">{formatShiftSummary()}</p>
          <p className="text-xs text-gray-500">Weekly off: {renderWeeklyOff()}</p>
        </div>

        {availabilitySelectedNurse ? (
          <div className="space-y-5">
            {availabilityDetailLoading && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
                Loading availability details...
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">Shift Start</label>
                <input
                  type="time"
                  value={shiftForm.startTime}
                  onChange={(e) => onShiftTimeChange('startTime', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">Shift End</label>
                <input
                  type="time"
                  value={shiftForm.endTime}
                  onChange={(e) => onShiftTimeChange('endTime', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Weekly Off Days</label>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day) => {
                  const isSelected = shiftForm.weeklyOffDays.includes(day.value)
                  return (
                    <button
                      type="button"
                      key={day.value}
                      onClick={() => onToggleWeeklyOffDay(day.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        isSelected ? 'bg-teal-50 text-teal-700 border-teal-200' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {availabilityFeedback.message && (
              <div
                className={`text-sm px-3 py-2 rounded-lg ${
                  availabilityFeedback.type === 'success'
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}
              >
                {availabilityFeedback.message}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                {availabilityData ? 'Update allocation' : 'Assign new allocation'}
              </p>
              <button
                onClick={onSaveShift}
                disabled={savingShift || availabilityDetailLoading}
                className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
              >
                {savingShift ? 'Saving...' : availabilityData ? 'Update shift' : 'Assign shift'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center">
            <p className="text-gray-600 font-semibold">Search and select a nurse to configure availability</p>
            <p className="text-sm text-gray-400 mt-1">Use the roster search above to begin.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default AvailabilityPanel
