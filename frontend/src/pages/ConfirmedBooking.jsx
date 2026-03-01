import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { connectSocket, disconnectSocket, getSocket } from '../services/socket'

const ConfirmedBooking = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [service, setService] = useState(null)
  const [nurse, setNurse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentUserId, setCurrentUserId] = useState(null)
  
  // Chat states
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const socketRef = useRef(null)
  const chatInitialized = useRef(false)

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  useEffect(() => {
    // Initialize chat only for CONFIRMED bookings
    if (booking && booking.status === 'CONFIRMED' && !chatInitialized.current) {
      initializeChat()
      chatInitialized.current = true
    }
    
    return () => {
      if (socketRef.current && chatInitialized.current) {
        socketRef.current.off('nurseChatJoined')
        socketRef.current.off('newNurseChatMessage')
        socketRef.current.off('nurseChatError')
        socketRef.current.emit('leaveRoom', { bookingId })
        disconnectSocket()
        chatInitialized.current = false
      }
    }
  }, [booking, bookingId])

  const fetchBookingDetails = async () => {
    try {
      // Fetch booking details (includes service and nurse details)
      const bookingResponse = await axios.get(
        `http://localhost:5003/api/booking/${bookingId}`,
        { withCredentials: true }
      )

      if (bookingResponse.data.success) {
        const bookingData = bookingResponse.data.booking
        setBooking(bookingData)
        setService(bookingData.service)
        setNurse(bookingData.nurse)
      }

      // Get current user ID
      const authCheck = await axios.get('http://localhost:5003/api/auth/me', {
        withCredentials: true
      })
      if (authCheck.data.success && authCheck.data.user) {
        // Try multiple possible field names for user ID
        const userId = authCheck.data.user.userId || authCheck.data.user.id || authCheck.data.user._id
        console.log('Current User ID:', userId)
        setCurrentUserId(userId)
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch booking details')
      console.error('Error fetching booking:', err)
    } finally {
      setLoading(false)
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

  const formatDateTime = (date, startMinutes) => {
    const dateObj = new Date(date)
    const dateStr = dateObj.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const hours = Math.floor(startMinutes / 60)
    const mins = startMinutes % 60
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const timeStr = `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`
    
    return { dateStr, timeStr }
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

  // Chat functionality
  const initializeChat = () => {
    try {
      const socket = connectSocket()
      socketRef.current = socket

      socket.on('nurseChatJoined', (data) => {
        console.log('Successfully joined nurse chat:', data)
        fetchMessages(1)
      })

      socket.on('newNurseChatMessage', (data) => {
        setMessages((prev) => {
          // Prevent duplicate messages
          const isDuplicate = prev.some(msg => 
            msg.message === data.message && 
            msg.createdAt === data.timestamp &&
            JSON.stringify(msg.senderId) === JSON.stringify(data.sender)
          )
          if (isDuplicate) return prev
          
          return [...prev, {
            senderId: data.sender,
            message: data.message,
            createdAt: data.timestamp
          }]
        })
        scrollToBottom()
      })

      socket.on('nurseChatError', (error) => {
        console.error('Nurse chat error:', error)
        setError(error)
      })

      socket.emit('joinNurseChat', { bookingId })
    } catch (err) {
      console.error('Error initializing chat:', err)
    }
  }

  const fetchMessages = async (page = 1) => {
    setChatLoading(true)
    try {
      const response = await axios.get(
        `http://localhost:5003/api/messages/chat/${bookingId}?page=${page}`,
        { withCredentials: true }
      )

      if (response.data.success) {
        const newMessages = response.data.messages.reverse()
        
        if (page === 1) {
          setMessages(newMessages)
          setTimeout(scrollToBottom, 100)
        } else {
          setMessages((prev) => [...newMessages, ...prev])
        }
        
        setHasMoreMessages(response.data.pagination.hasNextPage)
        setCurrentPage(page)
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err.response?.data?.message || 'Failed to fetch messages')
    } finally {
      setChatLoading(false)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return

    socketRef.current.emit('nurseChatMessage', {
      data: newMessage,
      bookingId
    })

    setNewMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current
      
      if (scrollTop === 0 && hasMoreMessages && !chatLoading) {
        fetchMessages(currentPage + 1)
      }
    }
  }

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking || !service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'The booking you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/services')}
              className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              Back to Services
            </button>
          </div>
        </div>
      </div>
    )
  }

  const images = service.images && service.images.length > 0 
    ? service.images 
    : [{ url: null, isPrimary: true }]

  const { dateStr, timeStr } = formatDateTime(booking.date, booking.startMinutes)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Status Banner */}
      <div className={`py-4 ${
        booking.status === 'CONFIRMED' ? 'bg-green-500' : 
        booking.status === 'COMPLETED' ? 'bg-blue-500' : 
        'bg-red-500'
      } text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3">
            {booking.status === 'CONFIRMED' && (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold text-lg">Booking Confirmed Successfully!</p>
              </>
            )}
            {booking.status === 'COMPLETED' && (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold text-lg">Service Completed Successfully!</p>
              </>
            )}
            {booking.status === 'CANCELLED' && (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="font-semibold text-lg">Booking Cancelled</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - Images and Chat - Shows second on mobile (order-2 lg:order-1) */}
          {booking.status === 'CONFIRMED' ? (
          <div className="order-2 lg:order-1">
            {/* Service Images - Always visible */}
            <div className="rounded-lg overflow-hidden shadow-lg mb-4">
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
                <div className="bg-white p-4 flex gap-4 text-xs text-gray-700 font-medium border-t border-gray-200">
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
          </div>
          ) : (
          // CANCELLED or COMPLETED - Show Service Images
          <div className="order-2 lg:order-1 rounded-lg overflow-hidden shadow-lg">
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
            <div className="bg-white p-4 flex gap-4 text-xs text-gray-700 font-medium border-t border-gray-200">
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
          )}

          {/* Right Section - Service Details - Shows first on mobile (order-1 lg:order-2) */}
          <div className="order-1 lg:order-2 bg-white rounded-lg shadow-lg p-8">
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

            {/* Booking Details */}
            <div className="mb-6 pb-6 border-b border-gray-200 bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Booking Details</h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{dateStr}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{timeStr}</span>
                </div>
                {nurse && (
                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Nurse: {nurse.name}</span>
                  </div>
                )}
              </div>
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
              <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">AMOUNT PAID</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-600">{formatPrice(booking.totalPrice)}</span>
                <span className="text-gray-600">/session</span>
              </div>
            </div>

            {/* Service Address */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Service Address</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  {booking.address.flatNumber}, {booking.address.locality}
                </p>
                <p className="text-gray-700">
                  {booking.address.city}, {booking.address.state} - {booking.address.pincode}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/services')}
                className="flex-1 py-3 border-2 border-primary-500 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all"
              >
                Back to Services
              </button>
              <button
                onClick={() => navigate('/my-bookings')}
                className="flex-1 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Icon - Only for CONFIRMED bookings */}
      {booking?.status === 'CONFIRMED' && (
        <>
          {/* Chat Icon Button - Always shows chat bubble icon */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChat(!showChat)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-primary-500 text-white rounded-full shadow-2xl hover:bg-primary-600 transition-all flex items-center justify-center z-50"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </motion.button>

          {/* Floating Chat Window */}
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.2 }}
                className="fixed bottom-28 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
              >
                {/* Chat Header */}
                <div className="bg-primary-500 text-white p-4 flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Chat with Nurse</h3>
                    {nurse && <p className="text-sm text-primary-100">{nurse.name}</p>}
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-white hover:text-primary-100 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Messages Container */}
                <div 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3"
                >
                  {chatLoading && currentPage === 1 ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {chatLoading && currentPage > 1 && (
                        <div className="flex justify-center py-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                        </div>
                      )}
                      {messages.map((msg, index) => {
                        const senderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId
                        const isCurrentUser = senderId === currentUserId
                        return (
                          <div key={index} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-lg p-3 ${
                              isCurrentUser 
                                ? 'bg-primary-500 text-white' 
                                : 'bg-white text-gray-800 border border-gray-200'
                            }`}>
                              {!isCurrentUser && msg.senderId?.name && (
                                <p className="text-xs font-semibold mb-1 text-gray-600">{msg.senderId.name}</p>
                              )}
                              <p className="text-sm break-words">{msg.message}</p>
                              <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}>
                                {formatMessageTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      <Footer />
    </div>
  )
}

export default ConfirmedBooking
