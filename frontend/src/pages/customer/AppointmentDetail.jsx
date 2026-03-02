import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../components/Navbar'

const AppointmentDetail = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAppointmentDetails()
  }, [appointmentId])

  const fetchAppointmentDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/appointment/${appointmentId}`,
        { withCredentials: true }
      )

      if (response.data.success) {
        setAppointment(response.data.appointment)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointment details')
      console.error('Error fetching appointment:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCategoryName = (category) => {
    if (!category) return 'CONSULTATION'
    return category.toUpperCase().replace('-', ' ') + ' DEPARTMENT'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (startMinute) => {
    const hours = Math.floor(startMinute / 60)
    const mins = startMinute % 60
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '45 minutes'
    return `${minutes} minutes`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointment details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Appointment Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'The appointment you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/customer')}
              className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const doctor = appointment.doctorId
  const consultation = appointment.consultationId

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Image Banner */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000"
            alt="Hospital corridor"
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/70"></div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-20">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-white hover:text-gray-200 font-medium transition-colors group"
        >
          <svg 
            className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Main Content */}
          <div className="p-8 md:p-12">
            {/* Category Label */}
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-3" style={{ letterSpacing: '0.15em' }}>
              {formatCategoryName(consultation?.category)}
            </p>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {consultation?.title || 'Specialist Consultation'}
            </h1>

            {/* Appointment Time with Icon */}
            <div className="flex items-start gap-3 mb-8 pb-8 border-b border-gray-200">
              <div className="flex-shrink-0 w-5 h-5 text-gray-500 mt-1">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {formatDate(appointment.date)}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Duration: {formatDuration(consultation?.duration || 45)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 mb-8">
              <p className="text-gray-700 leading-relaxed">
                {consultation?.description || `A comprehensive ${formatCategoryName(consultation?.category).toLowerCase()} assessment including high-resolution monitoring and clinical consultation with Dr. ${doctor?.name}. This session focuses on heart rhythm analysis, blood pressure regulation, and diagnostic history review.`}
              </p>

              <p className="text-gray-700 leading-relaxed">
                <strong>Consultation with:</strong> Dr. {doctor?.name}
              </p>

              <div className="bg-blue-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
                <p className="text-sm text-gray-700">
                  <strong className="text-primary-700">Video Call Consultation:</strong> This is an online video consultation. You will receive the meeting link before your appointment time.
                </p>
              </div>

              {/* Slot Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-2 font-semibold">
                  Scheduled Time Slot
                </p>
                <p className="text-sm text-gray-800">
                  {formatTime(appointment.startMinute)} - {formatTime(appointment.endMinute)}
                </p>
              </div>
            </div>

            {/* Call to Action Button */}
            <button
              onClick={() => navigate('/my-appointments')}
              className="w-full py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl"
            >
              View All My Appointments
            </button>
          </div>

          {/* Status Badge at bottom */}
          <div className={`px-8 md:px-12 py-4 ${
            appointment.status === 'CONFIRMED' ? 'bg-green-50 border-t-2 border-green-500' :
            appointment.status === 'COMPLETED' ? 'bg-blue-50 border-t-2 border-blue-500' :
            'bg-gray-50 border-t-2 border-gray-500'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                Appointment Status
              </p>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                appointment.status === 'CONFIRMED' ? 'bg-green-500 text-white' :
                appointment.status === 'COMPLETED' ? 'bg-blue-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {appointment.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentDetail
