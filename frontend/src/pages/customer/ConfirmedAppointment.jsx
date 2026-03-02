import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const ConfirmedAppointment = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeStatus, setTimeStatus] = useState('') // 'before', 'active', 'past'
  const [timeLeft, setTimeLeft] = useState('')
  const [showPrescription, setShowPrescription] = useState(false)
  const [prescription, setPrescription] = useState(null)
  const [inVideoCall, setInVideoCall] = useState(false)

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

  const fetchPrescription = async () => {
    // If already loaded, just toggle visibility
    if (prescription) {
      setShowPrescription(prev => !prev)
      return
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/appointment/prescription/${appointmentId}`,
        { withCredentials: true }
      )
      if (response.data.success) {
        setPrescription(response.data.prescription)
        setShowPrescription(true)
      }
    } catch (err) {
      if (err.response?.status === 404) {
        alert('Prescription not yet available. Your doctor will provide it after the consultation.')
      } else {
        alert('Failed to fetch prescription')
      }
    }
  }

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

  const formatCategoryName = (category) => {
    if (!category) return 'GENERAL CONSULTATION'
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .toUpperCase()
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

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={() => navigate('/my-bookings')}
                className="px-6 py-3 bg-white border-2 border-primary-500 text-primary-500 font-medium rounded-lg hover:bg-primary-50 transition-colors"
              >
                Go to My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const doctor = appointment.doctorId
  const consultation = appointment.consultationId

  // If in video call, show video interface
  if (inVideoCall) {
    return <VideoCallInterface appointmentId={appointmentId} appointment={appointment} onLeave={() => setInVideoCall(false)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Navigation Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </button>
          <button
            onClick={() => navigate('/my-bookings')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Bookings
          </button>
        </div>

        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Appointment Confirmed!
          </h1>
          <p className="text-gray-600">
            Your video consultation has been successfully booked
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Banner Image */}
          <div className="relative h-56 overflow-hidden">
            <img
              src={consultation?.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000"}
              alt={consultation?.name || "Consultation"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-6">
              <span className="px-4 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-full">
                {appointment.status}
              </span>
            </div>
          </div>

          <div className="p-8">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-3">
              {formatCategoryName(consultation?.category)} • DEPARTMENT
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {consultation?.name || 'Video Consultation'}
            </h2>

            {/* Appointment Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(appointment.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Time</p>
                  <p className="font-semibold text-gray-900">
                    {formatTime(appointment.startMinute)} - {formatTime(appointment.endMinute)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Doctor</p>
                  <p className="font-semibold text-gray-900">Dr. {doctor?.name || 'Specialist'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Amount Paid</p>
                  <p className="font-semibold text-gray-900">{formatPrice(appointment.price)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-8 space-y-4">
              {/* Appointment Completed Banner */}
              {appointment.status === 'COMPLETED' && (
                <div className="w-full py-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center justify-center gap-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-700 font-semibold text-lg">Appointment Completed</span>
                </div>
              )}

              {/* Join Meeting Button — hidden when completed */}
              {appointment.status !== 'COMPLETED' && timeStatus !== 'past' && (
                <button
                  onClick={handleJoinMeeting}
                  disabled={timeStatus === 'before'}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                    timeStatus === 'active'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl animate-pulse-slow hover:scale-105'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {timeStatus === 'active' ? 'Join Video Consultation' : `Starts in ${timeLeft}`}
                </button>
              )}

              {/* View Prescription Button */}
              <button
                onClick={fetchPrescription}
                className="w-full py-4 bg-blue-50 border-2 border-blue-200 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {showPrescription ? 'Hide Prescription' : 'View Prescription'}
              </button>
            </div>
          </div>
        </div>

        {/* Inline Prescription Section */}
        {showPrescription && prescription && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Medical Prescription</h2>
                <p className="text-blue-100 text-sm mt-0.5">Dr. {doctor?.name || 'Specialist'}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={() => setShowPrescription(false)}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Diagnosis */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Diagnosis</p>
                <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{prescription.diagnosis}</p>
              </div>

              {/* Medicines */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Prescribed Medicines</p>
                <div className="space-y-3">
                  {prescription.medicines.map((medicine, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-lg">{medicine.name}</h4>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full capitalize">
                          {medicine.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div><span className="text-gray-500">Dosage:</span><span className="ml-2 font-medium text-gray-900">{medicine.dosagePerDay}x per day</span></div>
                        <div><span className="text-gray-500">Timing:</span><span className="ml-2 font-medium text-gray-900">{medicine.timing.replace('_', ' ')}</span></div>
                        <div><span className="text-gray-500">Duration:</span><span className="ml-2 font-medium text-gray-900">{medicine.durationInDays} days</span></div>
                      </div>
                      {medicine.instructions && (
                        <div className="mt-2 pt-2 border-t border-blue-100 text-sm text-gray-600">
                          <span className="text-gray-500">Instructions:</span> {medicine.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              {prescription.additionalNotes && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Additional Notes</p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-gray-700">{prescription.additionalNotes}</p>
                  </div>
                </div>
              )}

              {/* Follow-up Date */}
              {prescription.followUpDate && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Follow-up Date</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{new Date(prescription.followUpDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 text-right">
                Prescribed on {new Date(prescription.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Video Call Interface Component
const VideoCallInterface = ({ appointmentId, appointment, onLeave }) => {
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
        `${import.meta.env.VITE_API_URL}/api/appointment/video-call-token/${appointmentId}`,
        { withCredentials: true }
      )
      setToken(response.data.token)
      setChannelName(response.data.channelName)
      setAppId(response.data.appId)
      setUid(response.data.uid)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.mess || 'Failed to join video call')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg">Connecting to video call...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
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
    />
  )
}

// Agora Video Call Component
const AgoraVideoCall = ({ appId, channelName, token, uid, endEpochMs, onLeave }) => {
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
      AgoraRTC.setLogLevel(4) // suppress verbose logs

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
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
    <div className="min-h-screen bg-gray-900">
      <div className="relative h-screen">
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
                <p className="text-xl">{joined ? 'Waiting for doctor to join...' : 'Connecting...'}</p>
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
              className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors mx-2"
              title="End Call"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <Footer />
    </div>
  )
}

// Prescription Modal Component
const PrescriptionModal = ({ prescription, onClose, doctor }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getMedicineTypeLabel = (type) => {
    const types = {
      tablet: 'Tablet',
      capsule: 'Capsule',
      syrup: 'Syrup',
      injection: 'Injection',
      ointment: 'Ointment',
      other: 'Other'
    }
    return types[type] || type
  }

  const getTimingLabel = (timing) => {
    const timings = {
      before_food: 'Before Food',
      after_food: 'After Food',
      anytime: 'Anytime'
    }
    return timings[timing] || timing
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl pointer-events-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Medical Prescription</h2>
            <p className="text-blue-100">Dr. {doctor?.name || 'Specialist'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Diagnosis */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Diagnosis</h3>
            <p className="text-lg text-gray-900">{prescription.diagnosis}</p>
          </div>

          {/* Medicines */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Prescribed Medicines</h3>
            <div className="space-y-4">
              {prescription.medicines.map((medicine, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-lg">{medicine.name}</h4>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      {getMedicineTypeLabel(medicine.type)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Dosage:</span>
                      <span className="ml-2 font-medium text-gray-900">{medicine.dosagePerDay}x per day</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Timing:</span>
                      <span className="ml-2 font-medium text-gray-900">{getTimingLabel(medicine.timing)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 font-medium text-gray-900">{medicine.durationInDays} days</span>
                    </div>
                  </div>
                  {medicine.instructions && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-500 text-sm">Instructions:</span>
                      <p className="text-gray-700 text-sm mt-1">{medicine.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          {prescription.additionalNotes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Additional Notes</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-gray-700">{prescription.additionalNotes}</p>
              </div>
            </div>
          )}

          {/* Follow Up */}
          {prescription.followUpDate && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Follow-up Date</h3>
              <div className="flex items-center gap-2 text-gray-900">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{formatDate(prescription.followUpDate)}</span>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="text-sm text-gray-500 text-right">
            Prescribed on {formatDate(prescription.createdAt)}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmedAppointment
