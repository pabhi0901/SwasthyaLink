import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const MyAppointments = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'CONFIRMED', 'COMPLETED'
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [now, setNow] = useState(() => new Date())

  // Tick every 30 seconds so live status stays fresh
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const isLive = (appointment) => {
    if (appointment.status !== 'CONFIRMED') return false
    const apptDate = new Date(appointment.date)
    apptDate.setHours(0, 0, 0, 0)
    const start = new Date(apptDate.getTime() + appointment.startMinute * 60000)
    const end   = new Date(apptDate.getTime() + appointment.endMinute   * 60000)
    return now >= start && now <= end
  }

  const itemsPerPage = 6

  useEffect(() => {
    fetchAppointments()
  }, [filter, currentPage])

  const fetchAppointments = async () => {
    setLoading(true)
    setError('')

    try {
      let url = `${import.meta.env.VITE_API_URL}/api/appointment/my-appointments?page=${currentPage}&limit=${itemsPerPage}`
      
      if (filter !== 'all') {
        url += `&status=${filter}`
      }

      const response = await axios.get(url, { withCredentials: true })

      if (response.data.success) {
        setAppointments(response.data.appointments || [])
        setTotalPages(response.data.pagination?.totalPages || 1)
        setTotalCount(response.data.pagination?.totalAppointments || 0)
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
      } else {
        setError(err.response?.data?.message || 'Failed to fetch appointments')
      }
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`
  }

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase()
    
    if (statusLower === 'confirmed') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Upcoming</span>
    } else if (statusLower === 'completed') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Completed</span>
    } else if (statusLower === 'cancelled') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Cancelled</span>
    } else if (statusLower === 'pending_payment' || statusLower === 'pending') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>
    }
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange('CONFIRMED')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'CONFIRMED'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => handleFilterChange('COMPLETED')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'COMPLETED'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start shadow-sm">
          <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-800 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {appointments.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-sm">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No {filter === 'all' ? '' : filter === 'CONFIRMED' ? 'Upcoming' : 'Completed'} Appointments Found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {filter === 'all' 
              ? "You haven't booked any appointments yet."
              : `You don't have any ${filter === 'CONFIRMED' ? 'upcoming' : 'completed'} appointments.`
            }
          </p>
          <button
            onClick={() => navigate('/appointments')}
            className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse Appointments
          </button>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <p className="text-sm text-gray-600 mb-4">
            Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalCount}</span> appointment{totalCount !== 1 ? 's' : ''}
          </p>

          {/* Appointments List */}
          <div className="space-y-4 mb-8">
            {appointments.map((appointment) => {
              const live = isLive(appointment)
              return (
              <div
                key={appointment._id}
                onClick={() => navigate(`/confirmed-appointment/${appointment._id}`)}
                className={`bg-white rounded-xl transition-all duration-300 overflow-hidden cursor-pointer group ${
                  live
                    ? 'shadow-[0_0_0_2px_#22c55e,0_0_24px_rgba(34,197,94,0.35)] border-2 border-green-400 hover:shadow-[0_0_0_2px_#16a34a,0_0_32px_rgba(34,197,94,0.5)]'
                    : 'shadow-md hover:shadow-xl border border-gray-100 hover:border-primary-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Doctor Image */}
                  <div className="sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-primary-50 to-blue-50 flex-shrink-0 flex items-center justify-center">
                    {appointment.doctorId?.image ? (
                      <img
                        src={appointment.doctorId.image}
                        alt={appointment.doctorId.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                          {appointment.consultationId?.name || 'Video Consultation'}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {appointment.consultationId?.category?.replace(/_/g, ' ') || 'General Consultation'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {live && (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            Live Now
                          </span>
                        )}
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{formatTime(appointment.startMinute)}</span>
                      </div>
                      {appointment.doctorId && (
                        <div className="flex items-center text-gray-700">
                          <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm font-medium">Dr. {appointment.doctorId.name}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">Video Call</span>
                      </div>
                    </div>

                    {appointment.consultationId?.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {appointment.consultationId.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all shadow-sm ${
                          currentPage === page
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    )
                  }
                  return null
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MyAppointments
