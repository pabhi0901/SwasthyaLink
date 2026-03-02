import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiRefreshCcw, FiMail, FiPhone, FiUser } from 'react-icons/fi'

const API_BASE = `${import.meta.env.VITE_API_URL}/api`
const DOCTORS_LIMIT = 12

const ManageDoctors = () => {
  const navigate = useNavigate()

  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDoctors: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [togglingDoctorId, setTogglingDoctorId] = useState('')
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  useEffect(() => {
    fetchDoctors(1)
  }, [])

  const fetchDoctors = async (page = 1) => {
    setLoading(true)
    setError('')
    const search = searchTerm.trim()
    const endpoint = search
      ? `${API_BASE}/admin/doctors/search`
      : `${API_BASE}/admin/doctors`
    const params = { page, limit: DOCTORS_LIMIT }
    if (search) params.name = search

    try {
      const { data } = await axios.get(endpoint, {
        params,
        withCredentials: true
      })

      setDoctors(data.doctors || [])
      setPagination({
        currentPage: data.pagination?.currentPage || page,
        totalPages: data.pagination?.totalPages || 1,
        totalDoctors: data.pagination?.totalDoctors || 0
      })
    } catch (err) {
      console.error('Failed to fetch doctors:', err)
      setDoctors([])
      setError(err.response?.data?.message || 'Unable to fetch doctors right now.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchDoctors(1)
  }

  const handleResetSearch = () => {
    setSearchTerm('')
    fetchDoctors(1)
  }

  const handlePagination = (direction) => {
    const { currentPage, totalPages } = pagination
    if (direction === 'next' && currentPage < totalPages) {
      fetchDoctors(currentPage + 1)
    }
    if (direction === 'prev' && currentPage > 1) {
      fetchDoctors(currentPage - 1)
    }
  }

  const handleToggleStatus = async (doctorId) => {
    if (!doctorId) return
    setTogglingDoctorId(doctorId)
    setFeedback({ type: '', message: '' })

    try {
      const { data } = await axios.patch(
        `${API_BASE}/admin/doctors/${doctorId}/toggle-access`,
        {},
        { withCredentials: true }
      )

      setDoctors((prev) =>
        prev.map((doctor) =>
          doctor._id === doctorId
            ? {
                ...doctor,
                isActive:
                  typeof data.data?.isActive === 'boolean'
                    ? data.data.isActive
                    : !doctor.isActive
              }
            : doctor
        )
      )

      setFeedback({
        type: 'success',
        message: data.message || 'Doctor status updated successfully.'
      })
    } catch (err) {
      console.error('Failed to toggle doctor status:', err)
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Unable to update doctor status right now.'
      })
    } finally {
      setTogglingDoctorId('')
    }
  }

  const stats = {
    active: doctors.filter((d) => d.isActive).length,
    inactive: doctors.filter((d) => !d.isActive).length
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="flex min-h-full">
        <aside className="fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-gray-200 flex flex-col h-screen">
          <div className="px-4 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mt-1">Doctor Management</h2>
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1">
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              <FiUser className="w-4 h-4 text-indigo-600" />
              Doctor List
            </button>
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-3">
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold"
            >
              Back to main panel
            </button>
            <div className="text-xs text-gray-400 text-center">SwasthyaLink v1.0</div>
          </div>
        </aside>

        <main className="flex-1 min-h-screen overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 lg:ml-60">
          <section className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">All Doctors</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage doctor accounts and access permissions.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="text-center px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="text-xs text-emerald-600 font-medium">Active</p>
                    <p className="text-lg font-bold text-emerald-700">{stats.active}</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-xl bg-rose-50 border border-rose-200">
                    <p className="text-xs text-rose-600 font-medium">Inactive</p>
                    <p className="text-lg font-bold text-rose-700">{stats.inactive}</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200">
                    <p className="text-xs text-indigo-600 font-medium">Total</p>
                    <p className="text-lg font-bold text-indigo-700">{pagination.totalDoctors}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by doctor name..."
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSearch className="w-4 h-4" />
                    Search
                  </button>
                  <button
                    onClick={handleResetSearch}
                    disabled={loading || !searchTerm.trim()}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset
                  </button>
                </div>
                <button
                  onClick={() => fetchDoctors(pagination.currentPage)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiRefreshCcw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {feedback.message && (
                <div
                  className={`mt-4 rounded-xl p-4 text-sm ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border border-rose-200 text-rose-600'
                  }`}
                >
                  {feedback.message}
                </div>
              )}
            </div>

            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`doctor-skeleton-${index}`}
                    className="h-32 bg-white border border-gray-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-sm text-rose-600">
                {error}
              </div>
            )}

            {!loading && !error && !doctors.length && (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500 text-sm">
                {searchTerm.trim()
                  ? 'No doctors found matching your search.'
                  : 'No doctors registered yet.'}
              </div>
            )}

            {!loading && !error && !!doctors.length && (
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <DoctorCard
                    key={doctor._id}
                    doctor={doctor}
                    onToggle={handleToggleStatus}
                    isToggling={togglingDoctorId === doctor._id}
                  />
                ))}
              </div>
            )}

            {doctors.length > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-600 bg-white rounded-2xl border border-gray-100 p-4">
                <p>
                  Page {pagination.currentPage} of {pagination.totalPages} — {pagination.totalDoctors} total doctors
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePagination('prev')}
                    disabled={pagination.currentPage === 1 || loading}
                    className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePagination('next')}
                    disabled={pagination.currentPage === pagination.totalPages || loading}
                    className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

const DoctorCard = ({ doctor, onToggle, isToggling }) => {
  if (!doctor) return null

  const initials = doctor.name ? doctor.name.slice(0, 2).toUpperCase() : 'DR'
  const badgeClasses = doctor.isActive
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-rose-50 text-rose-600 border-rose-200'

  return (
    <article
      className={`bg-white border rounded-2xl p-5 shadow-sm transition ${
        doctor.isActive ? 'border-gray-100' : 'border-rose-100 bg-rose-50/40'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4 flex-1">
          {doctor.image ? (
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 font-bold text-lg flex items-center justify-center">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{doctor.name || 'Unknown Doctor'}</h3>
            {doctor.specialization && (
              <p className="text-sm text-indigo-600 font-medium mt-0.5">{doctor.specialization}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-2">
              {doctor.email && (
                <span className="inline-flex items-center gap-1.5">
                  <FiMail className="w-4 h-4" />
                  {doctor.email}
                </span>
              )}
              {doctor.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <FiPhone className="w-4 h-4" />
                  {doctor.phone}
                </span>
              )}
            </div>
            {doctor.experienceYears && (
              <p className="text-xs text-gray-500 mt-2">
                {doctor.experienceYears} {doctor.experienceYears === 1 ? 'year' : 'years'} of experience
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span
            className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeClasses}`}
          >
            {doctor.isActive ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={() => onToggle(doctor._id)}
            disabled={isToggling || !doctor._id}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors ${
              doctor.isActive
                ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
            } ${isToggling || !doctor._id ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {doctor.isActive ? 'Disable Access' : 'Enable Access'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ManageDoctors
