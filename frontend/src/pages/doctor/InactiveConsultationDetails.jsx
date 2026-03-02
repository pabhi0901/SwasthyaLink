import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const InactiveConsultationDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const categories = {
    general_physician: 'General Physician',
    pediatrics: 'Pediatrics',
    gynecology: 'Gynecology',
    dermatology: 'Dermatology',
    orthopedics: 'Orthopedics',
    cardiology: 'Cardiology',
    neurology: 'Neurology',
    psychiatry: 'Psychiatry',
    ent: 'ENT',
    ophthalmology: 'Ophthalmology',
    dentistry: 'Dentistry',
    pulmonology: 'Pulmonology',
    endocrinology: 'Endocrinology',
    gastroenterology: 'Gastroenterology',
    urology: 'Urology'
  }

  useEffect(() => {
    fetchCompletedAppointments()
  }, [id])

  const fetchCompletedAppointments = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/doctor/consultation/${id}/completed-appointments`,
        { withCredentials: true }
      )

      if (response.data.success) {
        setData(response.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch completed appointments')
      console.error('Error fetching completed appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultation details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={() => navigate('/doctor/all-consultations')}
                className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
              >
                Back to All Consultations
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { consultation, appointments, count, totalEarnings } = data

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/doctor/all-consultations')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Inactive Consultation Details</h2>
          <p className="text-gray-600 mt-1">View completed appointments and earnings</p>
        </div>
      </div>

      {/* Consultation Info Card */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          {consultation.image ? (
            <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden shrink-0">
              <img
                src={consultation.image}
                alt={consultation.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full md:w-48 h-48 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          )}

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{consultation.name}</h3>
                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                  Inactive
                </span>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{consultation.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-medium">Category:</span>
                <span className="ml-2">{categories[consultation.category]}</span>
              </div>

              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Date:</span>
                <span className="ml-2">{formatDate(consultation.date)}</span>
              </div>

              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Price per slot:</span>
                <span className="ml-2 text-green-600 font-semibold">₹{consultation.price}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 border-2 border-blue-200 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">Completed Appointments</p>
              <p className="text-4xl font-bold text-blue-700 mt-2">{count}</p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border-2 border-green-200 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium uppercase tracking-wide">Total Earnings</p>
              <p className="text-4xl font-bold text-green-700 mt-2">₹{totalEarnings.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Appointments Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Completed Appointments</h3>
          <p className="text-gray-600 mt-1">All appointments that have been completed for this consultation</p>
        </div>

        {count === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Appointments</h3>
            <p className="text-gray-600">This consultation doesn't have any completed appointments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {formatDate(appointment.date)}
                        </div>
                        <div className="text-gray-500">
                          {formatTime(appointment.startMinute)} - {formatTime(appointment.startMinute + appointment.duration)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                          {appointment.patientId?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patientId?.name || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900">{appointment.patientId?.email || 'N/A'}</div>
                        <div className="text-gray-500">{appointment.patientId?.phone || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        ₹{appointment.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default InactiveConsultationDetails
