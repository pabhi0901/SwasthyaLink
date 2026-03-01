import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { connectSocket, disconnectSocket, getSocket } from '../../services/socket'

const BookingDetail = () => {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Booking data from navigation state or fetched from API
  const [booking, setBooking] = useState(location.state?.booking || null)
  const [bookingLoading, setBookingLoading] = useState(!location.state?.booking)

  // Chat state
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [chatLoading, setChatLoading] = useState(true)
  const [chatPage, setChatPage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [chatError, setChatError] = useState('')
  const [isOnline, setIsOnline] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [completedSuccess, setCompletedSuccess] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [myUserId, setMyUserId] = useState(null)
  const [receiverId, setReceiverId] = useState(null)

  // Refs
  const chatContainerRef = useRef(null)
  const socketRef = useRef(null)
  const isInitialLoadRef = useRef(true)
  const prevScrollHeightRef = useRef(0)

  const chatPageRef = useRef(1)
  const hasMoreRef = useRef(false)
  const loadingMoreRef = useRef(false)
  const myUserIdRef = useRef(null)
  const receiverIdRef = useRef(null)

  // Fetch booking from API if not available in location state (e.g. page reload)
  useEffect(() => {
    if (booking) return
    const fetchBooking = async () => {
      try {
        console.log("Ruun hai ji");
        
        const res = await axios.get(
          `http://localhost:5003/api/nurse/booking/${bookingId}`,
          { withCredentials: true }
        )
        if (res.data) {
          setBooking(res.data.booking)
        //   console.log(res.data);
          
        } else {
          navigate('/nurse', { replace: true })
        }
      } catch (err) {
        console.error('Error fetching booking:', err)
        navigate('/nurse', { replace: true })
      } finally {
        setBookingLoading(false)
      }
    }
    fetchBooking()
  }, [bookingId])

  // Fetch current user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5003/api/auth/me', { withCredentials: true })
        if (res.data.success) {
          const userId = res.data.user.id || res.data.user._id
          setMyUserId(userId)
          myUserIdRef.current = userId
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }
    fetchUser()
  }, [])

  const isChatEnabled = booking?.status === 'CONFIRMED' && !completedSuccess

  // Socket setup - only connect if booking is CONFIRMED
  useEffect(() => {
    if (!bookingId || !isChatEnabled) {
      setChatLoading(false)
      return
    }

    const socket = connectSocket()
    socketRef.current = socket

    // Join the chat room
    socket.emit('joinNurseChat', { bookingId })

    socket.on('nurseChatJoined', (data) => {
      console.log('Chat joined:', data)
      setIsOnline(true)
      setReceiverId(data.receiverId)
      receiverIdRef.current = data.receiverId
    })

    socket.on('newNurseChatMessage', (msg) => {
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        senderId: typeof msg.sender === 'string' ? { _id: msg.sender } : msg.sender,
        message: msg.message,
        createdAt: msg.timestamp || new Date().toISOString()
      }])

      // Auto-scroll to bottom for new messages
      setTimeout(() => {
        scrollToBottom()
      }, 50)
    })

    socket.on('nurseChatError', (error) => {
      console.error('Chat error:', error)
      setChatError(error)
      setChatLoading(false)
    })

    return () => {
      socket.off('nurseChatJoined')
      socket.off('newNurseChatMessage')
      socket.off('nurseChatError')
    }
  }, [bookingId, isChatEnabled])

  // Fetch initial messages when chat is enabled
  useEffect(() => {
    if (!isChatEnabled) return
    fetchMessages(1)
  }, [isChatEnabled])

  const fetchMessages = async (page = 1) => {
    if (page === 1) {
      setChatLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const res = await axios.get(
        `http://localhost:5003/api/messages/chat/${bookingId}?page=${page}`,
        { withCredentials: true }
      )

      if (res.data) {
        const fetchedMessages = [...res.data.messages].reverse() // API returns newest first, we want oldest first
        console.log(res.data);
        
        if (page === 1) {
          setMessages(fetchedMessages)
          isInitialLoadRef.current = true
          setTimeout(() => scrollToBottom(), 50)
        } else {
          // Prepend older messages
          prevScrollHeightRef.current = chatContainerRef.current?.scrollHeight || 0
          setMessages(prev => [...fetchedMessages, ...prev])
        }

        setChatPage(page)
        chatPageRef.current = page
        setHasMoreMessages(res.data.pagination.hasNextPage)
        hasMoreRef.current = res.data.pagination.hasNextPage
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      setChatError('Failed to load messages')
    } finally {
      setChatLoading(false)
      setLoadingMore(false)
      loadingMoreRef.current = false
    }
  }

  // Maintain scroll position after prepending old messages
  useEffect(() => {
    if (!isInitialLoadRef.current && chatContainerRef.current && prevScrollHeightRef.current) {
      const newScrollHeight = chatContainerRef.current.scrollHeight
      chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current
      prevScrollHeightRef.current = 0
    }
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
    }
  }, [messages])

  // Scroll to top detection for loading more messages
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return
    const { scrollTop } = chatContainerRef.current

    if (scrollTop <= 10 && hasMoreRef.current && !loadingMoreRef.current) {
      loadingMoreRef.current = true
      fetchMessages(chatPageRef.current + 1)
    }
  }, [])

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const sendMessage = () => {
    const text = newMessage.trim()
    if (!text || !socketRef.current) return

    socketRef.current.emit('nurseChatMessage', {
      data: text,
      bookingId
    })

    setNewMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleMarkCompleted = async () => {
    setActionLoading(true)
    try {
      const res = await axios.patch(
        `http://localhost:5003/api/nurse/booking/${bookingId}/complete`,
        {},
        { withCredentials: true }
      )
      if (res.data.success) {
        setCompletedSuccess(true)
        setTimeout(() => navigate('/nurse', { replace: true }), 1500)
      }
    } catch (err) {
      console.error('Error marking booking as completed:', err)
      setChatError(err.response?.data?.message || 'Failed to mark as completed')
    } finally {
      setActionLoading(false)
    }
  }

  const formatTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  if (bookingLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!booking) return null

  const serviceImages = booking.service?.images || []
  const primaryImage = serviceImages.find(img => img.isPrimary)?.url || serviceImages[0]?.url

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Left Panel - Service Info */}
      <div className="lg:w-1/2 xl:w-[55%] p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/nurse')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to Orders</span>
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Service Image */}
          {serviceImages.length > 0 ? (
            <div className="relative bg-gray-100">
              <img
                src={serviceImages[currentImageIndex]?.url || primaryImage}
                alt={booking.service?.name}
                className="w-full h-48 sm:h-56 object-cover"
              />
              {serviceImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {serviceImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 h-48 sm:h-56 flex items-center justify-center">
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}

          <div className="p-5 sm:p-6">
            {/* Service Name */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
              {booking.service?.category
                ? booking.service.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                : ''}{' '}
              {booking.service?.name ? `- ${booking.service.name}` : ''}
            </h1>

            {/* Patient Name & Contact */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Patient Name</p>
                <p className="text-sm font-medium text-gray-900">{booking.customer?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contact Number</p>
                <p className="text-sm font-medium text-gray-900">{booking.customer?.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Service Address */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Service Address</p>
              <p className="text-sm font-medium text-gray-900">
                {booking.address?.flatNumber}, {booking.address?.locality}, {booking.address?.city},{' '}
                {booking.address?.state} - {booking.address?.pincode}
              </p>
            </div>

            {/* Schedule Date & Time */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Schedule Date</p>
                <p className="text-sm font-medium text-teal-700">{formatDate(booking.date)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Service Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatTime(booking.startMinutes)} - {formatTime(booking.endMinutes)}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            {!completedSuccess && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-teal-300 text-teal-700 bg-teal-50 mb-5">
                CONFIRMED
              </span>
            )}
            {completedSuccess && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-green-300 text-green-700 bg-green-50 mb-5">
                COMPLETED
              </span>
            )}

            {/* Mark as Completed Button */}
            {!completedSuccess && (
              <button
                onClick={handleMarkCompleted}
                disabled={actionLoading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Marking...
                  </span>
                ) : (
                  'Mark as Completed'
                )}
              </button>
            )}
            {completedSuccess && (
              <div className="w-full py-3 bg-green-100 text-green-700 font-semibold rounded-xl text-center">
                Booking marked as completed! Redirecting...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="lg:w-1/2 xl:w-[45%] border-l border-gray-200 flex flex-col bg-white h-[500px] lg:h-full">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">Chat with Patient</h2>
            {isChatEnabled && (
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
            )}
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>
        </div>

        {!isChatEnabled ? (
          /* Chat disabled state */
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <p className="text-gray-500 font-medium mb-1">Chat Unavailable</p>
              <p className="text-sm text-gray-400">
                {completedSuccess || booking?.status === 'COMPLETED'
                  ? 'This booking has been completed. Chat is no longer available.'
                  : 'Chat is only available for confirmed bookings.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            >
              {/* Loading more indicator */}
              {loadingMore && (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {chatLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading messages...</p>
                  </div>
                </div>
              ) : chatError && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-red-500">{chatError}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm text-gray-400">No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId
                  const isMe = senderId === myUserId

                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${isMe ? 'order-1' : 'order-1'}`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-teal-600 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <p className={`text-[11px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                          {formatMessageTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Chat Input */}
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                  disabled={!isOnline}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isOnline}
                  className="w-8 h-8 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BookingDetail
