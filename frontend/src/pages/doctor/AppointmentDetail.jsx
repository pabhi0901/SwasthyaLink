import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const EMPTY_MEDICINE = { name: '', type: 'tablet', dosagePerDay: 1, timing: 'after_food', durationInDays: 1, instructions: '' }
const EMPTY_PRESCRIPTION_FORM = { diagnosis: '', additionalNotes: '', followUpDate: '', medicines: [{ ...EMPTY_MEDICINE }] }

const AppointmentDetail = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  
  const [appointment, setAppointment] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false)
  const [error, setError] = useState('')
  const [showPrescriptions, setShowPrescriptions] = useState(false)
  const [timeStatus, setTimeStatus] = useState('') // 'before', 'active', 'past'
  const [timeLeft, setTimeLeft] = useState('')
  const [inVideoCall, setInVideoCall] = useState(false)
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)
  const [prescriptionDone, setPrescriptionDone] = useState(false)
  const [prescriptionFormData, setPrescriptionFormData] = useState({ ...EMPTY_PRESCRIPTION_FORM, medicines: [{ ...EMPTY_MEDICINE }] })
  const [markingComplete, setMarkingComplete] = useState(false)
  const [appointmentCompleted, setAppointmentCompleted] = useState(false)

  useEffect(() => {
    fetchAppointmentDetails()
  }, [appointmentId])

  useEffect(() => {
    if (appointment) {
      const interval = setInterval(() => {
        checkMeetingTime()
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [appointment])

  const checkMeetingTime = () => {
    if (!appointment) return

    const now = new Date()
    const appointmentDate = new Date(appointment.date)
    
    // Set appointment date to start time
    appointmentDate.setHours(0, 0, 0, 0)
    const appointmentStartTime = new Date(appointmentDate.getTime() + appointment.startMinute * 60000)
    const appointmentEndTime = new Date(appointmentDate.getTime() + appointment.endMinute * 60000)

    if (now < appointmentStartTime) {
      setTimeStatus('before')
      const diff = appointmentStartTime - now
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    } else if (now >= appointmentStartTime && now <= appointmentEndTime) {
      setTimeStatus('active')
      setTimeLeft('')
    } else {
      setTimeStatus('past')
      setTimeLeft('')
    }
  }

  const handleJoinMeeting = () => {
    if (timeStatus === 'before') {
      alert(`Meeting starts in ${timeLeft}. Please wait until the scheduled time.`)
    } else if (timeStatus === 'active') {
      setInVideoCall(true)
    }
  }

  const handleMarkComplete = async () => {
    if (markingComplete || appointmentCompleted) return
    setMarkingComplete(true)
    try {
      await axios.patch('http://localhost:5003/api/appointment/mark-completed', { appointmentId }, { withCredentials: true })
      setAppointmentCompleted(true)
      setAppointment(prev => prev ? { ...prev, status: 'COMPLETED' } : prev)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as completed.')
    } finally {
      setMarkingComplete(false)
    }
  }

  const fetchAppointmentDetails = async () => {
    setLoading(true)
    setError('')

    try {
      // Fetch all consultations to find the appointment
      const consultationsResponse = await axios.get(
        'http://localhost:5003/api/doctor/my-active-consultations',
        { withCredentials: true }
      )

      if (consultationsResponse.data.success) {
        let foundAppointment = null
        
        // Search through all consultations for appointments
        for (const consultation of consultationsResponse.data.consultations) {
          const appointmentsResponse = await axios.get(
            `http://localhost:5003/api/doctor/consultation/${consultation._id}/confirmed-appointments`,
            { withCredentials: true }
          )
          
          if (appointmentsResponse.data.success) {
            foundAppointment = appointmentsResponse.data.appointments.find(
              apt => apt._id === appointmentId
            )
            
            if (foundAppointment) {
              foundAppointment.consultation = consultation
              break
            }
          }
        }

        if (foundAppointment) {
          setAppointment(foundAppointment)
        } else {
          setError('Appointment not found')
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointment details')
      console.error('Error fetching appointment details:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreviousPrescriptions = async () => {
    if (!appointment?.patientId?._id) return

    setLoadingPrescriptions(true)
    
    try {
      const response = await axios.get(
        `http://localhost:5003/api/doctor/patient/${appointment.patientId._id}/prescriptions`,
        { withCredentials: true }
      )

      if (response.data.success) {
        setPrescriptions(response.data.prescriptions)
        setShowPrescriptions(true)
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch prescriptions')
      console.error('Error fetching prescriptions:', err)
    } finally {
      setLoadingPrescriptions(false)
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
      'CONFIRMED': 'bg-green-100 text-green-700 border-green-300',
      'PENDING_PAYMENT': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'CANCELLED': 'bg-red-100 text-red-700 border-red-300',
      'COMPLETED': 'bg-blue-100 text-blue-700 border-blue-300',
      'NO_SHOW': 'bg-gray-100 text-gray-700 border-gray-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">{error || 'Appointment not found'}</h3>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // If in video call, show full-screen with floating overlay buttons
  if (inVideoCall) {
    return (
      <div className="relative h-screen overflow-hidden">
        <VideoCallInterface
          appointmentId={appointmentId}
          appointment={appointment}
          onLeave={() => setInVideoCall(false)}
        />

        {/* Floating action buttons - top-right corner over the video */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 items-end">
          {/* Prescription */}
          {prescriptionDone ? (
            <div className="px-4 py-2 bg-green-800/90 text-green-200 text-sm font-medium rounded-lg backdrop-blur-sm flex items-center gap-2 shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Prescription Saved
            </div>
          ) : (
            <button
              onClick={() => setShowPrescriptionForm(true)}
              className="px-4 py-2 bg-green-600/90 hover:bg-green-600 text-white text-sm font-semibold rounded-lg shadow-lg backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Add Prescription
            </button>
          )}

          {/* Mark as Completed - active only during or after meeting */}
          {appointment.status === 'CONFIRMED' && (timeStatus === 'active' || timeStatus === 'past') && (
            appointmentCompleted ? (
              <div className="px-4 py-2 bg-blue-800/90 text-blue-200 text-sm font-medium rounded-lg backdrop-blur-sm flex items-center gap-2 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Marked Completed
              </div>
            ) : (
              <button
                onClick={handleMarkComplete}
                disabled={markingComplete}
                className="px-4 py-2 bg-blue-600/90 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg backdrop-blur-sm transition-all flex items-center gap-2 disabled:opacity-60"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {markingComplete ? 'Marking...' : 'Mark as Completed'}
              </button>
            )
          )}
        </div>

        {/* Prescription form floating over the video call */}
        {showPrescriptionForm && (
          <PrescriptionFormModal
            appointment={appointment}
            formData={prescriptionFormData}
            setFormData={setPrescriptionFormData}
            fromVideoCall
            onHide={() => setShowPrescriptionForm(false)}
            onSuccess={() => {
              setPrescriptionDone(true)
              setShowPrescriptionForm(false)
              setPrescriptionFormData({ ...EMPTY_PRESCRIPTION_FORM, medicines: [{ ...EMPTY_MEDICINE }] })
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient & Appointment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Information</h2>
            
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-700">
                {appointment.patientId?.name?.charAt(0).toUpperCase() || 'P'}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {appointment.patientId?.name || 'N/A'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{appointment.patientId?.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{appointment.patientId?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Appointment Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-gray-600">Consultation</span>
                </div>
                <span className="font-semibold text-gray-900">{appointment.consultation?.name || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">Date</span>
                </div>
                <span className="font-semibold text-gray-900">{formatDate(appointment.date)}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">Time Slot</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatTime(appointment.startMinute)} - {formatTime(appointment.endMinute)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">Price</span>
                </div>
                <span className="font-semibold text-green-600 text-lg">₹{appointment.price}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">Status</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Previous Prescriptions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              {/* Join Meeting Button */}
              {timeStatus === 'active' && appointment.status === 'CONFIRMED' && (
                <button
                  onClick={handleJoinMeeting}
                  className="w-full px-4 py-3 bg-linear-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex items-center justify-center animate-pulse shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join Meeting Now
                </button>
              )}
              
              {timeStatus === 'before' && appointment.status === 'CONFIRMED' && (
                <button
                  onClick={handleJoinMeeting}
                  disabled
                  className="w-full px-4 py-3 bg-gray-300 text-gray-600 font-medium rounded-lg cursor-not-allowed flex flex-col items-center justify-center"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Meeting Starts In
                  </div>
                  <span className="text-sm font-bold mt-1">{timeLeft}</span>
                </button>
              )}
              
              {prescriptionDone ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Prescription Added
                </div>
              ) : (
                <button
                  onClick={() => setShowPrescriptionForm(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Add Prescription
                </button>
              )}

              <button
                onClick={fetchPreviousPrescriptions}
                disabled={loadingPrescriptions}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {loadingPrescriptions ? 'Loading...' : 'View Previous Prescriptions'}
              </button>

              <button
                onClick={() => navigate(`/doctor/consultation/${appointment.consultationId}`)}
                className="w-full px-4 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Consultation
              </button>

              {/* Mark as Completed - only active during or after meeting time */}
              {appointment.status === 'CONFIRMED' && (timeStatus === 'active' || timeStatus === 'past') && (
                appointmentCompleted ? (
                  <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-4 py-3 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Marked as Completed
                  </div>
                ) : (
                  <button
                    onClick={handleMarkComplete}
                    disabled={markingComplete}
                    className="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {markingComplete ? 'Marking...' : 'Mark as Completed'}
                  </button>
                )
              )}

              {appointment.status === 'CONFIRMED' && timeStatus === 'before' && (
                <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-3 rounded-lg text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Complete button activates at meeting time
                </div>
              )}
            </div>
          </div>

          {/* Patient Stats */}
          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Patient History</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-700">Total Prescriptions</span>
                <span className="text-2xl font-bold text-blue-900">{prescriptions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Previous Prescriptions Section */}
      {showPrescriptions && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Previous Prescriptions</h2>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
              {prescriptions.length} prescriptions
            </span>
          </div>

          {prescriptions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Previous Prescriptions</h3>
              <p className="text-gray-600">This is the first prescription for this patient by you.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription, index) => (
                <div
                  key={prescription._id}
                  className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        Prescription #{prescriptions.length - index}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(prescription.createdAt)}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {prescription.appointmentId?.status || 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis:</p>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded">{prescription.diagnosis}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Medicines:</p>
                      <div className="space-y-2">
                        {prescription.medicines.map((medicine, idx) => (
                          <div key={idx} className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{medicine.name}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="inline-flex items-center mr-3">
                                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                    </svg>
                                    {medicine.type}
                                  </span>
                                  <span className="inline-flex items-center mr-3">
                                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {medicine.dosagePerDay}x/day
                                  </span>
                                  <span className="inline-flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {medicine.durationInDays} days
                                  </span>
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Timing: <span className="font-medium">{medicine.timing.replace('_', ' ')}</span>
                                </p>
                                {medicine.instructions && (
                                  <p className="text-sm text-gray-600 mt-1 italic">
                                    Note: {medicine.instructions}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {prescription.additionalNotes && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes:</p>
                        <p className="text-gray-900 bg-yellow-50 p-2 rounded border border-yellow-200">
                          {prescription.additionalNotes}
                        </p>
                      </div>
                    )}

                    {prescription.followUpDate && (
                      <div className="flex items-center text-sm text-gray-600 bg-green-50 p-2 rounded">
                        <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Follow-up Date: <span className="font-medium ml-1">{formatDate(prescription.followUpDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showPrescriptionForm && (
        <PrescriptionFormModal
          appointment={appointment}
          formData={prescriptionFormData}
          setFormData={setPrescriptionFormData}
          onHide={() => setShowPrescriptionForm(false)}
          onSuccess={() => {
            setPrescriptionDone(true)
            setShowPrescriptionForm(false)
            setPrescriptionFormData({ ...EMPTY_PRESCRIPTION_FORM, medicines: [{ ...EMPTY_MEDICINE }] })
          }}
        />
      )}
    </div>
  )
}

// Prescription Form Modal — form data lives in parent so it persists across hide/show cycles
const PrescriptionFormModal = ({ appointment, formData, setFormData, onHide, onSuccess, fromVideoCall = false }) => {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { diagnosis, additionalNotes, followUpDate, medicines } = formData

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const addMedicine = () =>
    setFormData(prev => ({ ...prev, medicines: [...prev.medicines, { ...EMPTY_MEDICINE }] }))

  const removeMedicine = (index) => {
    if (medicines.length === 1) return
    setFormData(prev => ({ ...prev, medicines: prev.medicines.filter((_, i) => i !== index) }))
  }

  const updateMedicine = (index, field, value) =>
    setFormData(prev => {
      const updated = [...prev.medicines]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, medicines: updated }
    })

  const handleSubmit = async () => {
    setSubmitError('')
    if (!diagnosis.trim()) { setSubmitError('Diagnosis is required.'); return }
    for (const m of medicines) {
      if (!m.name.trim()) { setSubmitError('All medicine names are required.'); return }
    }
    setSubmitting(true)
    try {
      const patientId = appointment.patientId?._id || appointment.patientId
      const appointmentId = appointment._id
      await axios.post('http://localhost:5003/api/doctor/add-prescription', {
        patientId, appointmentId, diagnosis, additionalNotes,
        followUpDate: followUpDate || undefined, medicines
      }, { withCredentials: true })
      onSuccess()
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to add prescription.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${fromVideoCall ? 'bg-black/40 backdrop-blur-sm' : 'bg-black/55'}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Prescription</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {fromVideoCall ? 'Filling during live call — data is preserved when hidden' : 'Data is preserved if you hide and return'}
            </p>
          </div>
          <button
            onClick={onHide}
            title="Hide (your progress is saved)"
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Diagnosis <span className="text-red-500">*</span>
            </label>
            <textarea
              value={diagnosis}
              onChange={e => update('diagnosis', e.target.value)}
              rows={2}
              placeholder="Enter diagnosis..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Medicines <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addMedicine}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medicine {index + 1}</span>
                    {medicines.length > 1 && (
                      <button type="button" onClick={() => removeMedicine(index)} className="text-red-400 hover:text-red-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name *</label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={e => updateMedicine(index, 'name', e.target.value)}
                        placeholder="Medicine name"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Type</label>
                      <select
                        value={med.type}
                        onChange={e => updateMedicine(index, 'type', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="tablet">Tablet</option>
                        <option value="capsule">Capsule</option>
                        <option value="syrup">Syrup</option>
                        <option value="injection">Injection</option>
                        <option value="ointment">Ointment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Doses/Day</label>
                      <input
                        type="number"
                        min="1"
                        value={med.dosagePerDay}
                        onChange={e => updateMedicine(index, 'dosagePerDay', parseInt(e.target.value) || 1)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Timing</label>
                      <select
                        value={med.timing}
                        onChange={e => updateMedicine(index, 'timing', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="before_food">Before Food</option>
                        <option value="after_food">After Food</option>
                        <option value="anytime">Anytime</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Duration (days)</label>
                      <input
                        type="number"
                        min="1"
                        value={med.durationInDays}
                        onChange={e => updateMedicine(index, 'durationInDays', parseInt(e.target.value) || 1)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Instructions</label>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={e => updateMedicine(index, 'instructions', e.target.value)}
                      placeholder="e.g. Take with water"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes</label>
            <textarea
              value={additionalNotes}
              onChange={e => update('additionalNotes', e.target.value)}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Follow-up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={e => update('followUpDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {submitError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 shrink-0">
          <button
            type="button"
            onClick={onHide}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Hide (progress saved)
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Prescription
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Video Call Interface Component
const VideoCallInterface = ({ appointmentId, appointment, onLeave, contained = false }) => {
  const [token, setToken] = useState('')
  const [channelName, setChannelName] = useState('')
  const [appId, setAppId] = useState('')
  const [uid, setUid] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Compute meeting end timestamp from appointment data
  const endEpochMs = (() => {
    if (!appointment) return null
    const d = new Date(appointment.date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() + appointment.endMinute * 60000
  })()

  useEffect(() => {
    fetchVideoToken()
  }, [])

  const fetchVideoToken = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5003/api/appointment/video-call-token/${appointmentId}`,
        { withCredentials: true }
      )
      setToken(response.data.token)
      setChannelName(response.data.channelName)
      setAppId(response.data.appId)
      setUid(response.data.uid)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join video call')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`${contained ? 'h-full' : 'min-h-screen'} bg-gray-900 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg">Connecting to video call...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${contained ? 'h-full' : 'min-h-screen'} bg-gray-900 flex items-center justify-center`}>
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Cannot Join Meeting</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={onLeave}
            className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <AgoraVideoCall 
      appId={appId}
      channelName={channelName}
      token={token}
      uid={uid}
      endEpochMs={endEpochMs}
      onLeave={onLeave}
      contained={contained}
    />
  )
}

// Agora Video Call Component
const AgoraVideoCall = ({ appId, channelName, token, uid, endEpochMs, onLeave, contained = false }) => {
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [remoteUserCount, setRemoteUserCount] = useState(0)
  const [joined, setJoined] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [timeLeft, setTimeLeft] = useState('')

  const clientRef = useRef(null)
  const localAudioTrackRef = useRef(null)
  const localVideoTrackRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const remoteVideoTrackRef = useRef(null)
  const hasJoinedRef = useRef(false)

  useEffect(() => {
    if (hasJoinedRef.current) return
    hasJoinedRef.current = true
    joinChannel()
    return () => { leaveChannel() }
  }, [])

  // Auto-cutoff timer
  useEffect(() => {
    if (!endEpochMs) return
    const tick = () => {
      const remaining = endEpochMs - Date.now()
      if (remaining <= 0) {
        setTimeLeft('00:00')
        handleLeave()
        return
      }
      const m = Math.floor(remaining / 60000)
      const s = Math.floor((remaining % 60000) / 1000)
      setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [endEpochMs])

  // Play remote video AFTER React has rendered the div
  useEffect(() => {
    if (remoteVideoTrackRef.current && remoteVideoRef.current && remoteUserCount > 0) {
      remoteVideoTrackRef.current.play(remoteVideoRef.current)
    }
  }, [remoteUserCount])

  const joinChannel = async () => {
    try {
      // Polyfill crypto.randomUUID for HTTP (non-HTTPS) dev environments
      if (typeof window !== 'undefined' && window.crypto && !window.crypto.randomUUID) {
        window.crypto.randomUUID = function () {
          return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
          )
        }
      }

      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
      AgoraRTC.setLogLevel(4)

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      clientRef.current = client

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType)
        if (mediaType === 'video') {
          remoteVideoTrackRef.current = user.videoTrack
          setRemoteUserCount(prev => prev + 1)
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play()
        }
      })

      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'video') {
          remoteVideoTrackRef.current = null
          setRemoteUserCount(prev => Math.max(0, prev - 1))
        }
      })

      client.on('user-left', () => {
        remoteVideoTrackRef.current = null
        setRemoteUserCount(0)
      })

      await client.join(appId, channelName, token, uid)

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
      localAudioTrackRef.current = audioTrack
      localVideoTrackRef.current = videoTrack

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current)
      }

      await client.publish([audioTrack, videoTrack])
      setJoined(true)
    } catch (err) {
      console.error('Agora join error:', err)
      setJoinError(err.message || 'Failed to connect')
    }
  }

  const leaveChannel = async () => {
    localAudioTrackRef.current?.close()
    localVideoTrackRef.current?.close()
    await clientRef.current?.leave()
  }

  const handleLeave = async () => {
    await leaveChannel()
    onLeave()
  }

  const toggleAudio = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!isAudioOn)
      setIsAudioOn(prev => !prev)
    }
  }

  const toggleVideo = async () => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setEnabled(!isVideoOn)
      setIsVideoOn(prev => !prev)
    }
  }

  if (joinError) {
    return (
      <div className={`${contained ? 'h-full' : 'min-h-screen'} bg-gray-900 flex items-center justify-center p-6`}>
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Connection Failed</h3>
          <p className="text-gray-400 mb-2 text-sm font-mono bg-gray-800 rounded px-3 py-2">{joinError}</p>
          <p className="text-gray-300 mb-6 text-sm">
            This is usually a browser security issue on HTTP. Please <span className="text-yellow-400 font-semibold">refresh the page</span> and click <span className="text-yellow-400 font-semibold">Join Meeting</span> again.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Page
            </button>
            <button onClick={onLeave} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${contained ? 'h-full' : 'min-h-screen'} bg-gray-900`}>
      <div className={`relative ${contained ? 'h-full' : 'h-screen'}`}>
        {/* Remote Video Area */}
        <div className="w-full h-full bg-gray-800 relative">
          {/* Always in DOM so Agora can play into it without a mount race */}
          <div ref={remoteVideoRef} className={`w-full h-full ${remoteUserCount === 0 ? 'hidden' : ''}`} />
          {remoteUserCount === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-xl">{joined ? 'Waiting for patient to join...' : 'Connecting...'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture in Picture) */}
        <div className="absolute top-4 right-4 w-64 h-48 rounded-lg shadow-2xl overflow-hidden border-2 border-white bg-gray-700">
          <div ref={localVideoRef} className="w-full h-full" />
          {!isVideoOn && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-full px-6 py-4 flex items-center gap-4 shadow-2xl">
            {/* Microphone Toggle */}
            <button
              onClick={toggleAudio}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
              }`}
              title={isAudioOn ? 'Mute' : 'Unmute'}
            >
              {isAudioOn ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
              }`}
              title={isVideoOn ? 'Stop Video' : 'Start Video'}
            >
              {isVideoOn ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
            </button>

            {/* End Call */}
            <button
              onClick={handleLeave}
              className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
              title="End Call"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${joined ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'}`} />
            <p className="text-sm">{joined ? 'Connected' : 'Connecting...'}</p>
          </div>
        </div>

        {/* Countdown Timer */}
        {timeLeft && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg px-5 py-2 text-white flex items-center gap-2">
            <svg className={`w-4 h-4 ${timeLeft === '00:00' ? 'text-red-400' : parseInt(timeLeft) < 5 ? 'text-yellow-400' : 'text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-sm font-mono font-semibold ${
              parseInt(timeLeft) === 0 ? 'text-red-400' :
              parseInt(timeLeft) < 5 ? 'text-yellow-400' : 'text-white'
            }`}>{timeLeft}</span>
            <span className="text-xs text-gray-400">remaining</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentDetail
