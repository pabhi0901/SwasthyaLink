import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const ServiceDetail = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Booking states
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    flatNumber: '',
    locality: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    fetchServiceDetails()
    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSelectedDate(tomorrow.toISOString().split('T')[0])
    setSelectedTime('09:00')
  }, [serviceId])

  const fetchServiceDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5003/api/services/${serviceId}`,
        { withCredentials: true }
      )

      if (response.data.success) {
        setService(response.data.service)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch service details')
      console.error('Error fetching service:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserAddresses = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5003/api/auth/addresses',
        { withCredentials: true }
      )
      if (response.data.success) {
        setAddresses(response.data.addresses)
      }
    } catch (err) {
      console.error('Error fetching addresses:', err)
      
      // Check for unauthorized error
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login', { state: { from: `/service/${serviceId}` } })
        return
      }
      
      setBookingError('Failed to fetch addresses. Please try again.')
    }
  }

  const handleConfirmBooking = async () => {
    if (!service?.isActive) return
    
    if (!selectedDate || !selectedTime) {
      setBookingError('Please select date and time for the service')
      return
    }

    // Check if user is logged in
    try {
      const authCheck = await axios.get('http://localhost:5003/api/auth/me', {
        withCredentials: true
      })
      
      if (!authCheck.data.success || !authCheck.data.user) {
        navigate('/login', { state: { from: `/service/${serviceId}` } })
        return
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      navigate('/login', { state: { from: `/service/${serviceId}` } })
      return
    }

    // Fetch user addresses and show modal
    await fetchUserAddresses()
    setShowAddressModal(true)
    setBookingError('')
  }

  const handleAddressSelection = async (address) => {
    setSelectedAddress(address)
    await proceedWithBooking(address)
  }

  const handleNewAddressSubmit = async () => {
    // Validate new address
    if (!newAddress.flatNumber || !newAddress.locality || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      setBookingError('Please fill all address fields')
      return
    }
    await proceedWithBooking(newAddress)
  }

  const proceedWithBooking = async (address) => {
    setBookingLoading(true)
    setBookingError('')

    try {
      // Parse time
      const [hours, minutes] = selectedTime.split(':').map(Number)

      const bookingData = {
        serviceId,
        date: selectedDate,
        startHour: hours,
        startMinute: minutes,
        address
      }

      const response = await axios.post(
        'http://localhost:5003/api/booking/create',
        bookingData,
        { withCredentials: true }
      )

      if (response.data.message === "Booking created successfully") {
        const { bookingId, nurseId, payment } = response.data
        
        // Initialize Razorpay payment
        const options = {
          key: 'rzp_test_RrZ4Isj9Rfj8Dz', // Razorpay test key
          amount: payment.amount,
          currency: payment.currency,
          order_id: payment.id,
          name: 'SwasthyaLink',
          description: service.name,
          handler: async function (paymentResponse) {
            try {
              // Verify payment
              const verifyResponse = await axios.post(
                'http://localhost:5003/api/booking/verify-payment',
                {
                  razorpayOrderId: payment.id,
                  paymentId: paymentResponse.razorpay_payment_id,
                  signature: paymentResponse.razorpay_signature,
                  bookingId
                },
                { withCredentials: true }
              )

              if (verifyResponse.data.message === "Payment verified and booking confirmed") {
                // Redirect to confirmed booking page
                navigate(`/confirmed-booking/${bookingId}`)
              }
            } catch (err) {
              setBookingError('Payment verification failed. Please contact support.')
              setShowAddressModal(false)
              setBookingLoading(false)
            }
          },
          modal: {
            ondismiss: function() {
              setBookingLoading(false)
              setShowAddressModal(false)
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: ''
          }
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      }
    } catch (err) {
      console.error('Booking error:', err)
      
      // Check for unauthorized error
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login', { state: { from: `/service/${serviceId}` } })
        return
      }
      
      const errorMessage = err.response?.data?.message || 'Failed to create booking'
      
      if (errorMessage.includes('No nurses available') || errorMessage.includes('nurse')) {
        setBookingError('No nurses available for this service at the selected time. Please try a different time slot.')
      } else if (err.response?.status === 500) {
        setBookingError('Internal server error. Please try again later.')
      } else {
        setBookingError(errorMessage)
      }
      
      setBookingLoading(false)
      setShowAddressModal(false)
    }
  }

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`
  }

  const formatDuration = (minutes) => {
    if (!minutes) return 'Duration varies'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
    return `${mins} minutes`
  }

  const formatCategoryName = (category) => {
    if (!category) return ''
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const nextImage = () => {
    if (service?.images && service.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % service.images.length)
    }
  }

  const previousImage = () => {
    if (service?.images && service.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + service.images.length) % service.images.length)
    }
  }

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value)
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading service details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'The service you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/services')}
              className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              Browse All Services
            </button>
          </div>
        </div>
      </div>
    )
  }

  const images = service.images && service.images.length > 0 
    ? service.images 
    : [{ url: null, isPrimary: true }]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Services Button */}
        <button
          onClick={() => navigate('/services')}
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
          Back to Services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Section - Image Carousel */}
          <div className="rounded-lg  h-auto  overflow-hidden shadow-lg">
            {/* Image Container */}
            <div className="relative h-96 lg:h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {images[currentImageIndex]?.url ? (
                    <img
                      src={images[currentImageIndex].url}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                      <svg className="w-32 h-32 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Verification Badges - Below Image */}
            <div className=" p-4 flex gap-4 text-xs text-gray-700 font-medium border-t ">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>VERIFIED CARE</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>SECURE PORTAL</span>
              </div>
            </div>
          </div>

          {/* Right Section - Service Details */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">
                {formatCategoryName(service.category)}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {service.name}
              </h1>
              <p className="text-gray-700 leading-relaxed">
                {service.description || 'High-quality medical care delivered at your doorstep by certified professionals.'}
              </p>
            </div>

            {/* Duration Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  {service.sessionDuration 
                    ? `Minimum ${formatDuration(service.sessionDuration)} per session` 
                    : 'Duration varies based on requirements'}
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">BASE RATE</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{formatPrice(service.price)}</span>
                <span className="text-gray-600">/session</span>
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Select Service Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={getTomorrowDate()}
                    onChange={handleDateChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time (24-hour format)
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {bookingError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{bookingError}</p>
              </div>
            )}

            {/* Confirm Booking Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={!service.isActive || bookingLoading}
              className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
                service.isActive && !bookingLoading
                  ? 'bg-primary-500 hover:bg-primary-600 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {bookingLoading ? 'Processing...' : service.isActive ? 'Confirm Booking' : 'Service Currently Unavailable'}
            </button>

            {!service.isActive && (
              <p className="mt-3 text-sm text-red-600 text-center">
                This service is temporarily unavailable. Please check back later.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Select Address</h2>
              <button
                onClick={() => {
                  setShowAddressModal(false)
                  setShowNewAddressForm(false)
                  setBookingError('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {bookingError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{bookingError}</p>
                </div>
              )}

              {!showNewAddressForm ? (
                <>
                  {/* Existing Addresses */}
                  <div className="space-y-3 mb-6">
                    {addresses.length > 0 ? (
                      addresses.map((address) => (
                        <button
                          key={address._id}
                          onClick={() => handleAddressSelection(address)}
                          disabled={bookingLoading}
                          className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <p className="font-medium text-gray-900">
                            {address.flatNumber}, {address.locality}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4">No saved addresses found</p>
                    )}
                  </div>

                  {/* Add New Address Button */}
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-primary-600 font-medium hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    + Add New Address
                  </button>
                </>
              ) : (
                <>
                  {/* New Address Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Flat/House Number
                      </label>
                      <input
                        type="text"
                        value={newAddress.flatNumber}
                        onChange={(e) => setNewAddress({ ...newAddress, flatNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., Flat 101"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Locality/Area
                      </label>
                      <input
                        type="text"
                        value={newAddress.locality}
                        onChange={(e) => setNewAddress({ ...newAddress, locality: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., MG Road"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Maharashtra"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., 400001"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setShowNewAddressForm(false)
                          setNewAddress({
                            flatNumber: '',
                            locality: '',
                            city: '',
                            state: '',
                            pincode: ''
                          })
                          setBookingError('')
                        }}
                        className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleNewAddressSubmit}
                        disabled={bookingLoading}
                        className="flex-1 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bookingLoading ? 'Processing...' : 'Proceed with this Address'}
                      </button>
                    </div>
                  </div>
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

export default ServiceDetail
