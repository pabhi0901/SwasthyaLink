import React, { useState, useEffect } from 'react'
import axios from 'axios'

const CompletedOrders = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalBookings: 0
  })

  useEffect(() => {
    fetchCompletedBookings(1)
  }, [])

  const fetchCompletedBookings = async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(
        `http://localhost:5003/api/nurse/completed-bookings?page=${page}&limit=10`,
        { withCredentials: true }
      )
      if (response.data.success) {
        setBookings(response.data.bookings)
        setPagination(response.data.pagination)
      }
    } catch (err) {
      console.error('Error fetching completed bookings:', err)
      setError('Failed to fetch completed bookings')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Completed Orders</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-gray-500 text-lg font-medium">No completed orders yet</p>
          <p className="text-gray-400 text-sm mt-1">Orders you complete will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.bookingId}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
            >
              {/* Top Row - Customer Name + Status */}
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {booking.customer?.name || 'Unknown Customer'}
                  </h3>
                  <p className="text-teal-600 text-sm font-medium">
                    {booking.service?.category ? booking.service.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''} - {booking.service?.name || 'Service'}
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-green-300 text-green-700 bg-green-50">
                  COMPLETED
                </span>
              </div>

              {/* Date/Time + Address Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(booking.date)} | {formatTime(booking.startMinutes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">
                    {booking.address?.flatNumber}, {booking.address?.locality}, {booking.address?.city}, {booking.address?.state}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm font-semibold text-gray-700">₹{booking.totalPrice}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => fetchCompletedBookings(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchCompletedBookings(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default CompletedOrders
