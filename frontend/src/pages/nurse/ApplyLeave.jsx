import React, { useState, useEffect } from 'react'
import axios from 'axios'

const ApplyLeave = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const [leaves, setLeaves] = useState([])
  const [leavesLoading, setLeavesLoading] = useState(true)
  const [leavesPagination, setLeavesPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalLeaves: 0
  })

  const [nurseId, setNurseId] = useState(null)

  // Get nurse ID on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true })
        if (res.data.success) {
          setNurseId(res.data.user.id || res.data.user._id)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }
    fetchUser()
  }, [])

  // Fetch leaves on mount
  useEffect(() => {
    fetchLeaves(1)
  }, [])

  const fetchLeaves = async (page = 1) => {
    setLeavesLoading(true)
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/nurse/leaves?page=${page}&limit=10`,
        { withCredentials: true }
      )
      if (res.data.success) {
        setLeaves(res.data.leaves)
        setLeavesPagination(res.data.pagination)
      }
    } catch (err) {
      console.error('Error fetching leaves:', err)
    } finally {
      setLeavesLoading(false)
    }
  }

  // Calculate minimum date (2 days from today)
  const getMinDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 4)
    return date.toISOString().split('T')[0]
  }

  const validate = () => {
    const errors = {}
    const minDate = getMinDate()

    if (!startDate) {
      errors.startDate = 'Start date is required'
    } else if (startDate < minDate) {
      errors.startDate = 'Leave must be at least 2 days from today'
    }

    if (!endDate) {
      errors.endDate = 'End date is required'
    } else if (startDate && endDate < startDate) {
      errors.endDate = 'End date cannot be before start date'
    }

    if (!reason.trim()) {
      errors.reason = 'Reason is required'
    } else if (reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters'
    } else if (reason.trim().length > 500) {
      errors.reason = 'Reason must be under 500 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validate()) return
    if (!nurseId) {
      setError('Unable to identify user. Please refresh.')
      return
    }

    setSubmitting(true)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/nurse/applyLeave/${nurseId}`,
        { startDate, endDate, reason: reason.trim() },
        { withCredentials: true }
      )
      if (res.data.success) {
        setSuccess('Leave application submitted successfully!')
        setStartDate('')
        setEndDate('')
        setReason('')
        setFieldErrors({})
        fetchLeaves(1)
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to submit leave application'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysCount = (start, end) => {
    const s = new Date(start)
    const e = new Date(end)
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
    return diff
  }

  const statusStyles = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200'
  }

  const statusIcons = {
    PENDING: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    APPROVED: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    REJECTED: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Apply for Leave</h1>

      {/* Leave Application Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">New Leave Request</h2>
            <p className="text-sm text-gray-500">Leave must be applied at least 2 days in advance</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                min={getMinDate()}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (endDate && e.target.value > endDate) setEndDate('')
                  setFieldErrors(prev => ({ ...prev, startDate: '' }))
                }}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                  fieldErrors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {fieldErrors.startDate && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                min={startDate || getMinDate()}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setFieldErrors(prev => ({ ...prev, endDate: '' }))
                }}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                  fieldErrors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {fieldErrors.endDate && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.endDate}</p>
              )}
            </div>
          </div>

          {/* Duration display */}
          {startDate && endDate && (
            <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-100 rounded-lg">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-teal-700">
                Duration: <span className="font-semibold">{getDaysCount(startDate, endDate)} day{getDaysCount(startDate, endDate) !== 1 ? 's' : ''}</span>
                <span className="text-teal-500 ml-2">({formatDate(startDate)} — {formatDate(endDate)})</span>
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Leave</label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setFieldErrors(prev => ({ ...prev, reason: '' }))
              }}
              rows={3}
              maxLength={500}
              placeholder="Please describe your reason for leave (min 10 characters)..."
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none ${
                fieldErrors.reason ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-1">
              {fieldErrors.reason ? (
                <p className="text-red-500 text-xs">{fieldErrors.reason}</p>
              ) : (
                <span />
              )}
              <p className={`text-xs ${reason.length > 480 ? 'text-red-500' : 'text-gray-400'}`}>
                {reason.length}/500
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Submit Leave Request
              </>
            )}
          </button>
        </form>
      </div>

      {/* Leave History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Leave History</h2>
          {leavesPagination.totalLeaves > 0 && (
            <span className="text-sm text-gray-500">{leavesPagination.totalLeaves} total</span>
          )}
        </div>

        {leavesLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : leaves.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No leave applications yet</p>
            <p className="text-gray-400 text-sm mt-1">Your leave history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaves.map((leave) => (
              <div key={leave._id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${statusStyles[leave.status]}`}>
                        {statusIcons[leave.status]}
                        {leave.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        Applied {formatDate(leave.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-1.5">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                      </span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">
                        {getDaysCount(leave.startDate, leave.endDate)} day{getDaysCount(leave.startDate, leave.endDate) !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {leave.reason && (
                      <p className="text-sm text-gray-500 line-clamp-2">{leave.reason}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {leavesPagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => fetchLeaves(leavesPagination.currentPage - 1)}
                  disabled={!leavesPagination.hasPrevPage}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {leavesPagination.currentPage} of {leavesPagination.totalPages}
                </span>
                <button
                  onClick={() => fetchLeaves(leavesPagination.currentPage + 1)}
                  disabled={!leavesPagination.hasNextPage}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplyLeave
