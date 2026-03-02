import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const ConsultationDetail = () => {
  const { consultationId } = useParams()
  const navigate = useNavigate()
  const [consultation, setConsultation] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [fetchingSlots, setFetchingSlots] = useState(false)

  useEffect(() => {
    fetchConsultationDetails()
  }, [consultationId])

  const fetchConsultationDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/doctor/search-consultations?search=`,
        { withCredentials: true }
      )

      if (response.data.success) {
        const consultationData = response.data.consultations.find(
          c => c._id === consultationId
        )
        
        if (!consultationData) {
          setError('Consultation not found')
          setLoading(false)
          return
        }
        
        setConsultation(consultationData)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch consultation details')
      console.error('Error fetching consultation:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    setFetchingSlots(true)
    try {
      console.log('Fetching slots for consultationId:', consultationId)
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/appointment/available-slots/${consultationId}`,
        { withCredentials: true }
      )

      console.log('Available slots response:', response.data)

      if (response.data.success) {
        setAvailableSlots(response.data.availableSlots || [])
        setShowSlotModal(true)
      }
    } catch (err) {
      console.error('Error fetching available slots:', err)
      console.error('Error response:', err.response?.data)
      alert(err.response?.data?.message || 'Failed to fetch available slots. Please try again.')
    } finally {
      setFetchingSlots(false)
    }
  }

  const handleBookClick = async () => {
    // Check if user is logged in
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true })
      // If logged in, fetch slots
      fetchAvailableSlots()
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Please login to book an appointment')
        navigate('/login')
      }
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

  const formatDuration = (minutes) => {
    if (!minutes) return '45 minutes'
    return `${minutes} minutes`
  }

  const handleProceedToPayment = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot')
      return
    }

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      alert('Payment gateway not loaded. Please refresh the page and try again.')
      return
    }

    setBookingLoading(true)

    try {
      // Step 1: Create appointment (returns appointment and payment details)
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/appointment/create-appointment`,
        {
          consultationId: consultationId,
          slotId: selectedSlot._id
        },
        { withCredentials: true }
      )

      if (response.data.appointment && response.data.paymentDetails) {
        const appointmentId = response.data.appointment._id
        const { orderId, amount, currency } = response.data.paymentDetails

        // Step 2: Load Razorpay and initiate payment
        const options = {
          key: 'rzp_test_RrZ4Isj9Rfj8Dz', // Razorpay key
          amount: amount,
          currency: currency,
          name: 'SwasthyaLink',
          description: consultation.name,
          order_id: orderId,
          handler: async function (razorpayResponse) {
            // Step 3: Confirm appointment after successful payment
            try {
              console.log('Payment successful, confirming appointment...')
              const confirmResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/appointment/confirm-appointment`,
                {
                  appointmentId: appointmentId,
                  razorpayOrderId: orderId,
                  paymentId: razorpayResponse.razorpay_payment_id,
                  signature: razorpayResponse.razorpay_signature
                },
                { withCredentials: true }
              )

              console.log('Confirmation response:', confirmResponse.data)
              
              if (confirmResponse.data.success) {
                // Step 4: Redirect to confirmed appointment page
                console.log('Redirecting to confirmed appointment page...')
                setBookingLoading(false)
                navigate(`/confirmed-appointment/${appointmentId}`)
              } else {
                setBookingLoading(false)
                alert('Payment confirmation failed. Please contact support.')
              }
            } catch (confirmErr) {
              console.error('Error confirming appointment:', confirmErr)
              console.error('Error details:', confirmErr.response?.data)
              setBookingLoading(false)
              alert('Payment successful but confirmation failed. Please contact support with payment ID: ' + razorpayResponse.razorpay_payment_id)
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: ''
          },
          theme: {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: function() {
              setBookingLoading(false)
            }
          }
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      }
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Please login to book an appointment')
        navigate('/login')
      } else {
        alert(err.response?.data?.mess || err.response?.data?.message || 'Failed to book appointment')
      }
      console.error('Error booking appointment:', err)
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading consultation details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Consultation Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'The consultation you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/appointments')}
              className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              Browse Consultations
            </button>
          </div>
        </div>
      </div>
    )
  }

  const doctor = consultation.doctorId

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors group"
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
          {/* Hero Image Banner */}
          <div className="relative h-64 overflow-hidden rounded-t-2xl">
            <img
              src={consultation.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000'}
              alt={consultation.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-6">
              <span className="px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full uppercase">
                {formatCategoryName(consultation.category)}
              </span>
            </div>
          </div>
          {/* Main Content */}
          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {consultation.name}
            </h1>

            {/* Consultation Info with Icon */}
            <div className="flex items-start gap-3 mb-8 pb-8 border-b border-gray-200">
              <div className="flex-shrink-0 w-5 h-5 text-gray-500 mt-1">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {formatDate(consultation.date)}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Duration: {formatDuration(consultation.duration)}
                </p>
                <p className="text-primary-600 font-semibold text-lg mt-2">
                  {formatPrice(consultation.price)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 mb-8">
              <p className="text-gray-700 leading-relaxed">
                {consultation.description}
              </p>

              <p className="text-gray-700 leading-relaxed">
                <strong>Doctor:</strong> Dr. {doctor?.name || 'Specialist'}
              </p>

              <div className="bg-blue-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong className="text-primary-700">• Video Call Consultation:</strong> This is an online video consultation. You will receive the meeting link after confirming your appointment.
                </p>
                <p className="text-sm text-gray-700">
                  <strong className="text-primary-700">• Booking Process:</strong> Click "Book Appointment" below to select your preferred time slot and proceed to secure payment.
                </p>
              </div>
            </div>

            {/* Call to Action Button */}
            {consultation.isActive ? (
              <button
                onClick={handleBookClick}
                disabled={fetchingSlots}
                className={`w-full py-4 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl ${
                  fetchingSlots
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {fetchingSlots ? 'Loading slots...' : 'Book Appointment'}
              </button>
            ) : (
              <div className="w-full py-4 px-6 bg-gray-100 border-2 border-gray-300 rounded-xl text-center">
                <p className="text-gray-600 font-semibold">Booking is currently off by the doctor</p>
                <p className="text-sm text-gray-500 mt-1">Please check back later</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slot Selection Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Select Time Slot</h3>
                <button
                  onClick={() => {
                    setShowSlotModal(false)
                    setSelectedSlot(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Choose a convenient time slot for your video consultation
              </p>
            </div>

            <div className="p-6">
              {availableSlots.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600 font-semibold">No available slots at the moment</p>
                  <p className="text-sm text-gray-500 mt-2">Please check back later or contact support</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot._id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedSlot?._id === slot._id
                            ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold shadow-md'
                            : 'border-gray-200 hover:border-primary-300 text-gray-700 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-sm font-semibold">
                          {formatTime(slot.startMinute)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          to {formatTime(slot.endMinute)}
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedSlot && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Selected Slot:</strong> {formatTime(selectedSlot.startMinute)} - {formatTime(selectedSlot.endMinute)}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleProceedToPayment}
                    disabled={!selectedSlot || bookingLoading}
                    className={`w-full py-4 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl ${
                      !selectedSlot || bookingLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    {bookingLoading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}

export default ConsultationDetail
