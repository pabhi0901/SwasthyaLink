import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const ConsultationDetails = () => {
  const { consultationId } = useParams()
  const navigate = useNavigate()
  
  const [consultation, setConsultation] = useState(null)
  const [appointments, setAppointments] = useState([])
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
    fetchConsultationDetails()
  }, [consultationId])

  const fetchConsultationDetails = async () => {
    setLoading(true)
    setError('')

    try {
      // Fetch consultation details from active consultations endpoint
      const consultationsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/doctor/my-active-consultations`,
        { withCredentials: true }
      )

      if (consultationsResponse.data.success) {
        const consultationData = consultationsResponse.data.consultations.find(
          c => c._id === consultationId
        )
        
        if (!consultationData) {
          setError('Consultation not found')
          setLoading(false)
          return
        }
        
        setConsultation(consultationData)
      }

      // Fetch confirmed appointments
      const appointmentsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/doctor/consultation/${consultationId}/confirmed-appointments`,
        { withCredentials: true }
      )

      if (appointmentsResponse.data.success) {
        setAppointments(appointmentsResponse.data.appointments)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch consultation details')
      console.error('Error fetching consultation details:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
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

  const getStatusColor = (status) => {
    const colors = {
      'CONFIRMED': 'bg-green-100 text-green-700 border-green-200',
      'PENDING_PAYMENT': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
      'COMPLETED': 'bg-blue-100 text-blue-700 border-blue-200',
      'NO_SHOW': 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultation details...</p>
        </div>
      </div>
    )
  }

  if (error || !consultation) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">{error || 'Consultation not found'}</h3>
          <button
            onClick={() => navigate('/doctor/active-consultations')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Active Consultations
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/doctor/active-consultations')}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Active Consultations
      </button>

      {/* Consultation Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="md:flex">
          {/* Image */}
          {consultation.image ? (
            <div className="md:w-1/3 h-64 md:h-auto">
              <img
                src={consultation.image}
                alt={consultation.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="md:w-1/3 h-64 md:h-auto bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          )}

          {/* Details */}
          <div className="md:w-2/3 p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{consultation.name}</h1>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                Active
              </span>
            </div>

            <p className="text-gray-600 mb-6">{consultation.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">{categories[consultation.category]}</p>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(consultation.date)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Time Range</p>
                  <p className="font-medium text-gray-900">
                    {formatTime(consultation.startMinutes)} - {formatTime(consultation.endMinutes)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium text-green-600 text-lg">₹{consultation.price}</p>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Total Slots</p>
                  <p className="font-medium text-gray-900">{consultation.slots.length}</p>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Duration per Slot</p>
                  <p className="font-medium text-gray-900">{consultation.duration} minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Slots</p>
              <p className="text-2xl font-bold text-gray-900">{consultation.slots.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-700">{appointments.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-yellow-700">
                {consultation.slots.length - appointments.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-purple-700">
                ₹{appointments.length * consultation.price}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots Grid Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Time Slots Overview</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-700">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 border-2 border-gray-300 rounded"></div>
              <span className="text-gray-700">Available</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {consultation.slots.map((slot) => {
            const appointment = appointments.find(
              apt => apt.startMinute === slot.startMinute && apt.endMinute === slot.endMinute
            )
            const isBooked = !!appointment

            return (
              <button
                key={slot._id}
                onClick={() => {
                  if (isBooked) {
                    navigate(`/doctor/appointment/${appointment._id}`)
                  }
                }}
                disabled={!isBooked}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  isBooked
                    ? 'border-green-500 bg-green-50 hover:bg-green-100 cursor-pointer hover:shadow-md'
                    : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
              >
                <div className={`font-semibold text-sm ${isBooked ? 'text-green-700' : 'text-gray-500'}`}>
                  {formatTime(slot.startMinute)}
                </div>
                <div className={`text-xs mt-1 ${isBooked ? 'text-green-600' : 'text-gray-400'}`}>
                  {formatTime(slot.endMinute)}
                </div>
                {isBooked && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="text-xs font-medium text-green-700 truncate">
                      {appointment.patientId?.name || 'Patient'}
                    </div>
                    <div className="text-xs text-green-600 mt-0.5">
                      Click for details
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Confirmed Appointments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Confirmed Appointments</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
            {appointments.length} appointments
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Confirmed Appointments</h3>
            <p className="text-gray-600">No patients have booked appointments for this consultation yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Time Slot</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr
                    key={appointment._id}
                    onClick={() => navigate(`/doctor/appointment/${appointment._id}`)}
                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4 text-gray-600">{index + 1}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-700 font-semibold">
                            {appointment.patientId?.name?.charAt(0).toUpperCase() || 'P'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{appointment.patientId?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{appointment.patientId?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{appointment.patientId?.phone || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{formatDate(appointment.date)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-gray-900">
                          {formatTime(appointment.startMinute)} - {formatTime(appointment.endMinute)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-green-600">₹{appointment.price}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
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

export default ConsultationDetails
