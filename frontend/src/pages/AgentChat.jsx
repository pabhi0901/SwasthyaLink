import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSend,
  FiPlus,
  FiMessageSquare,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiChevronRight,
  FiArrowLeft,
  FiActivity,
  FiShield,
  FiTrash2,
  FiXCircle,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { connectAgentSocket, getAgentSocket, getAgentUrl } from '../services/agentSocket';

const getEffectiveAgentApiUrl = () => {
  return getAgentUrl();
};

const getEffectiveMainApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://swasthyalink.onrender.com';
  }
  return (envUrl || 'http://localhost:5003').replace(/\/$/, '');
};

const AGENT_API_URL = getEffectiveAgentApiUrl();
const MAIN_API_URL = getEffectiveMainApiUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AgentChat() {
  const navigate = useNavigate();

  // User state
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Chats & message state
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatTitle, setActiveChatTitle] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Socket state
  const [socketConnected, setSocketConnected] = useState(false);

  // Active interactive booking state
  const [currentBookingState, setCurrentBookingState] = useState(null);
  // Payment countdown & state
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(600); // 10 minutes = 600s
  const [autoPayCountdown, setAutoPayCountdown] = useState(0); // 5s auto open countdown
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [paymentExpired, setPaymentExpired] = useState(false);
  const handleRazorpayPaymentRef = useRef(null);

  // Wizard form state
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState(10);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [addressData, setAddressData] = useState({
    flatNumber: '',
    locality: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
  });
  const [bookingFormError, setBookingFormError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Initial Authentication Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${MAIN_API_URL}/api/auth/me`, {
          withCredentials: true,
          headers: getAuthHeaders(),
        });
        if (res.data?.success && res.data?.user) {
          if (res.data?.token) {
            localStorage.setItem('authToken', res.data.token);
          }
          setCurrentUser(res.data.user);
          connectAgentSocket(res.data?.token);
        } else {
          navigate('/login?redirect=/chat');
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        navigate('/login?redirect=/chat');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // 2. Initialize Socket and Load Chats
  useEffect(() => {
    if (!currentUser) return;

    const socket = connectAgentSocket();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    const onAgentReady = (data) => {
      console.log('🤖 Agent ready:', data);
      setSocketConnected(true);
    };

    const onAgentMessage = (data) => {
      console.log('📩 Received agentMessage:', data);
      setAiThinking(false);

      if (data.chatId) {
        // Append AI message to thread
        const newMsgObj = {
          _id: data.messageId || Date.now().toString(),
          role: 'ai',
          message: data.message,
          paymentDetails: data.paymentId
            ? {
                paymentId: data.paymentId,
                bookingId: data.bookingId,
                amount: data.amount,
              }
            : null,
          paymentStatus: data.paymentStatus || null,
          paymentExpiresAt: data.paymentExpiresAt || null,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMsgObj]);

        // Update active booking stage state
        if (data.bookingStage === 'confirming_service') {
          setCurrentBookingState({
            bookingStage: 'confirming_service',
            available_services: data.available_services || [],
          });
          // Auto-select first service if available
          if (data.available_services?.length > 0) {
            setSelectedService(data.available_services[0]);
          }
          // Set default date to tomorrow
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const yyyy = tomorrow.getFullYear();
          const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
          const dd = String(tomorrow.getDate()).padStart(2, '0');
          setSelectedDate(`${yyyy}-${mm}-${dd}`);
        } else if (data.bookingStage === 'booking_success' && data.paymentId) {
          const expiresAt = data.paymentExpiresAt
            ? new Date(data.paymentExpiresAt).getTime()
            : Date.now() + 10 * 60 * 1000;
          const remaining = Math.max(
            0,
            Math.floor((expiresAt - Date.now()) / 1000)
          );

          if (data.paymentStatus === 'success') {
            setPaymentSuccessful(true);
            setPaymentExpired(false);
            setCurrentBookingState(null);
          } else if (remaining <= 0) {
            setPaymentSuccessful(false);
            setPaymentExpired(true);
            setPaymentTimeLeft(0);
            setAutoPayCountdown(0);
            setCurrentBookingState(null);
          } else {
            setCurrentBookingState({
              bookingStage: 'booking_success',
              paymentId: data.paymentId,
              bookingId: data.bookingId,
              amount: data.amount,
              createdAt: data.createdAt
                ? new Date(data.createdAt).getTime()
                : Date.now(),
              expiresAt,
              paymentStatus: 'pending',
            });
            setPaymentSuccessful(false);
            setPaymentExpired(false);
            setPaymentTimeLeft(remaining);
            setAutoPayCountdown(remaining > 0 ? 5 : 0); // 5s auto-open only if valid window
          }
        } else if (data.bookingStage === 'booking_failed') {
          setCurrentBookingState({
            bookingStage: 'booking_failed',
          });
        } else {
          setCurrentBookingState(null);
        }
      }
    };

    const onAgentError = (error) => {
      console.error('Agent error received:', error);
      setAiThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          role: 'ai',
          message:
            error?.message ||
            'I encountered an issue processing your request. Please try again.',
          createdAt: new Date().toISOString(),
          isError: true,
        },
      ]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('agentReady', onAgentReady);
    socket.on('agentMessage', onAgentMessage);
    socket.on('agentError', onAgentError);

    fetchUserChats();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('agentReady', onAgentReady);
      socket.off('agentMessage', onAgentMessage);
      socket.off('agentError', onAgentError);
    };
  }, [currentUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiThinking, currentBookingState]);

  // Fetch list of user's past chats
  const fetchUserChats = async () => {
    setLoadingChats(true);
    try {
      const res = await axios.get(`${AGENT_API_URL}/api/chat/my-chats`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data?.success) {
        setChats(res.data.chats || []);
        // Auto-select latest chat if available and none selected
        if (res.data.chats?.length > 0 && !activeChatId) {
          selectChat(res.data.chats[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user chats:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  // Select a chat room
  const selectChat = async (chat) => {
    setActiveChatId(chat._id);
    setActiveChatTitle(chat.title);
    setCurrentBookingState(null);
    setLoadingMessages(true);
    setSidebarOpen(false);

    try {
      const res = await axios.get(
        `${AGENT_API_URL}/api/chat/${chat._id}/messages`,
        {
          withCredentials: true,
          headers: getAuthHeaders(),
        }
      );
      if (res.data?.success) {
        const chatMessages = res.data.messages || [];
        setMessages(chatMessages);

        // Restore booking state if in progress
        const savedState = res.data.state;
        const essentials = savedState?.service_booking_essentials;

        // Check if there is any payment recorded in this chat
        const paymentMsg = [...chatMessages]
          .reverse()
          .find((m) => m.paymentDetails?.paymentId || m.paymentId || m.paymentStatus);

        const isPaymentSuccessful =
          paymentMsg?.paymentStatus === 'success' ||
          paymentMsg?.paymentStatus === 'COMPLETED' ||
          paymentMsg?.paymentStatus === 'CONFIRMED' ||
          essentials?.paymentStatus === 'success' ||
          essentials?.paymentStatus === 'COMPLETED' ||
          essentials?.paymentStatus === 'CONFIRMED' ||
          chatMessages.some((m) =>
            m.paymentStatus === 'success' ||
            m.paymentStatus === 'COMPLETED' ||
            m.paymentStatus === 'CONFIRMED' ||
            m.message?.includes('Payment verified and booking confirmed')
          );

        if (isPaymentSuccessful) {
          setPaymentSuccessful(true);
          setPaymentExpired(false);
          setAutoPayCountdown(0);
          // Payment already confirmed! Do NOT show bottom payment card
          setCurrentBookingState(null);
        } else if (
          essentials?.bookingStage === 'confirming_service' &&
          essentials?.available_services?.length > 0
        ) {
          setCurrentBookingState({
            bookingStage: 'confirming_service',
            available_services: essentials.available_services,
          });
          setSelectedService(essentials.available_services[0]);
        } else if (
          (essentials?.bookingStage === 'booking_success' && essentials?.paymentId) ||
          (paymentMsg &&
            (paymentMsg.paymentDetails?.paymentId || paymentMsg.paymentId) &&
            (paymentMsg.paymentStatus === 'pending' ||
              paymentMsg.paymentStatus === 'PENDING' ||
              paymentMsg.paymentStatus === 'PAYMENT_PENDING' ||
              !paymentMsg.paymentStatus))
        ) {
          const paymentId =
            essentials?.paymentId ||
            paymentMsg?.paymentDetails?.paymentId ||
            paymentMsg?.paymentId;
          const bookingId =
            essentials?.bookingId ||
            paymentMsg?.paymentDetails?.bookingId ||
            paymentMsg?.bookingId;
          const amount =
            essentials?.amount ||
            paymentMsg?.paymentDetails?.amount ||
            paymentMsg?.amount;

          const expiresAtRaw =
            paymentMsg?.paymentExpiresAt ||
            essentials?.paymentExpiresAt ||
            (paymentMsg?.createdAt
              ? new Date(paymentMsg.createdAt).getTime() + 10 * 60 * 1000
              : null);

          const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).getTime() : 0;
          const remaining = Math.max(
            0,
            Math.floor((expiresAt - Date.now()) / 1000)
          );

          if (remaining > 0) {
            // Still within the 10-minute validity window
            setCurrentBookingState({
              bookingStage: 'booking_success',
              paymentId,
              bookingId,
              amount,
              createdAt: paymentMsg?.createdAt
                ? new Date(paymentMsg.createdAt).getTime()
                : Date.now(),
              expiresAt,
              paymentStatus: 'pending',
            });
            setPaymentSuccessful(false);
            setPaymentExpired(false);
            setPaymentTimeLeft(remaining);
            setAutoPayCountdown(0); // don't auto open when switching past chats
          } else {
            // 10-minute payment window has expired! Dismiss payment card
            setPaymentSuccessful(false);
            setPaymentExpired(true);
            setPaymentTimeLeft(0);
            setAutoPayCountdown(0);
            setCurrentBookingState(null);
          }
        } else {
          setCurrentBookingState(null);
        }
      }
    } catch (err) {
      console.error('Error fetching messages for chat:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Start a fresh conversation
  const startNewChat = () => {
    setActiveChatId(null);
    setActiveChatTitle('');
    setMessages([]);
    setCurrentBookingState(null);
    setPaymentSuccessful(false);
    setPaymentExpired(false);
    setAutoPayCountdown(0);
    setInputMessage('');
    setSidebarOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Send message handler
  const handleSendMessage = async (customMessage = null) => {
    const textToSend = (customMessage || inputMessage).trim();
    if (!textToSend || aiThinking) return;

    if (!currentUser) {
      navigate('/login?redirect=/chat');
      return;
    }

    const socket = getAgentSocket();
    if (!socket) {
      alert('Socket connection is not ready. Please refresh the page.');
      return;
    }

    setInputMessage('');
    setAiThinking(true);

    let currentChatId = activeChatId;

    // CASE 1: First message in a brand new chat -> create chat session via API
    if (!currentChatId) {
      try {
        const createRes = await axios.post(
          `${AGENT_API_URL}/api/chat/create`,
          { message: textToSend },
          {
            withCredentials: true,
            headers: getAuthHeaders(),
          }
        );

        if (createRes.data?.success) {
          currentChatId = createRes.data.chatId;
          const newTitle = createRes.data.title || 'New Consultation';
          setActiveChatId(currentChatId);
          setActiveChatTitle(newTitle);

          const newChatObj = createRes.data.chat || {
            _id: currentChatId,
            title: newTitle,
            createdAt: new Date().toISOString(),
          };
          setChats((prev) => [newChatObj, ...prev]);
        } else {
          throw new Error(createRes.data?.message || 'Could not start chat');
        }
      } catch (err) {
        console.error('Error creating chat session:', err);
        setAiThinking(false);
        setMessages((prev) => [
          ...prev,
          {
            _id: Date.now().toString(),
            role: 'ai',
            message:
              'Unable to initiate chat session with the assistant. Please try again.',
            createdAt: new Date().toISOString(),
            isError: true,
          },
        ]);
        return;
      }
    }

    // Append user message locally to UI immediately
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        role: 'user',
        message: textToSend,
        createdAt: new Date().toISOString(),
      },
    ]);

    // Emit userMessage over socket
    socket.emit('userMessage', {
      userMessage: textToSend,
      chatId: currentChatId,
      bookingStage:
        currentBookingState?.bookingStage === 'confirming_service'
          ? 'chat'
          : currentBookingState?.bookingStage || 'chat',
    });
  };

  // Handle service booking confirmation submission
  const handleConfirmBookingSubmit = () => {
    setBookingFormError('');

    if (!selectedService) {
      setBookingFormError('Please select a service to proceed.');
      return;
    }
    if (!selectedDate) {
      setBookingFormError('Please select a booking date.');
      return;
    }
    if (
      !addressData.flatNumber ||
      !addressData.locality ||
      !addressData.city ||
      !addressData.state ||
      !addressData.pincode
    ) {
      setBookingFormError('Please complete all address fields.');
      return;
    }
    if (!/^[0-9]{6}$/.test(addressData.pincode)) {
      setBookingFormError('Pincode must be a 6-digit number.');
      return;
    }

    const socket = getAgentSocket();
    if (!socket || !activeChatId) return;

    setAiThinking(true);

    const payload = {
      userMessage: `Confirm booking for ${selectedService.name}`,
      chatId: activeChatId,
      bookingStage: 'booking',
      serviceId: selectedService.id || selectedService._id,
      date: selectedDate,
      startHour: Number(selectedHour),
      startMinute: Number(selectedMinute),
      address: {
        flatNumber: addressData.flatNumber.trim(),
        locality: addressData.locality.trim(),
        city: addressData.city.trim(),
        state: addressData.state.trim(),
        pincode: addressData.pincode.trim(),
      },
    };

    // Append user confirmation to message list
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        role: 'user',
        message: `Book ${selectedService.name} on ${selectedDate} at ${String(
          selectedHour
        ).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`,
        createdAt: new Date().toISOString(),
      },
    ]);

    // Reset wizard view while waiting
    setCurrentBookingState(null);

    // Emit booking stage to socket
    socket.emit('userMessage', payload);
  };

  // Handle service selection cancellation
  const handleCancelServiceSelection = () => {
    const socket = getAgentSocket();
    if (!socket || !activeChatId) return;

    setAiThinking(true);
    setCurrentBookingState(null);

    // User cancellation message
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        role: 'user',
        message: 'Cancel service selection',
        createdAt: new Date().toISOString(),
      },
    ]);

    // Socket special cancellation event as defined in agentChat.socket.js
    socket.emit('userMessage', {
      userMessage: 'No service selected',
      chatId: activeChatId,
      bookingStage: 'booking_failed',
    });
  };

  // Razorpay Checkout Trigger
  const handleRazorpayPayment = () => {
    if (paymentSuccessful || paymentExpired) return;
    if (!currentBookingState?.paymentId || !currentBookingState?.bookingId) {
      alert('Missing payment details. Please contact support.');
      return;
    }

    // Double check that the 10-minute window has not expired
    if (
      currentBookingState.expiresAt &&
      Date.now() >= currentBookingState.expiresAt
    ) {
      setPaymentExpired(true);
      setCurrentBookingState(null);
      alert(
        'The 10-minute payment window has expired. Please initiate a new booking.'
      );
      return;
    }

    setAutoPayCountdown(0); // Cancel auto-open timer if clicked manually
    const { paymentId, bookingId, amount } = currentBookingState;
    setPaymentProcessing(true);

    const options = {
      key: 'rzp_test_RrZ4Isj9Rfj8Dz', // Test key matching ServiceDetail.jsx
      amount: amount || 50000,
      currency: 'INR',
      order_id: paymentId,
      name: 'SwasthyaLink',
      description: 'Home Healthcare Service Confirmation',
      handler: async function (paymentResponse) {
        try {
          // Verify payment with existing backend API
          const verifyResponse = await axios.post(
            `${MAIN_API_URL}/api/booking/verify-payment`,
            {
              razorpayOrderId: paymentId,
              paymentId: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
              bookingId,
            },
            { withCredentials: true }
          );

          if (
            verifyResponse.data.message ===
            'Payment verified and booking confirmed'
          ) {
            // Notify Agent API to persist payment success and save confirmation message in DB
            let savedAiMessage = null;
            try {
              const agentSuccessRes = await axios.post(
                `${AGENT_API_URL}/api/chat/payment-success`,
                {
                  chatId: activeChatId,
                  paymentId,
                  bookingId,
                  amount,
                },
                {
                  withCredentials: true,
                  headers: getAuthHeaders(),
                }
              );
              if (agentSuccessRes.data?.chatMessage) {
                savedAiMessage = agentSuccessRes.data.chatMessage;
              }
            } catch (agentErr) {
              console.error(
                'Failed to notify agent server of payment success:',
                agentErr
              );
            }

            setPaymentSuccessful(true);
            setPaymentExpired(false);
            setPaymentProcessing(false);
            // Dismiss bottom payment card once payment is confirmed!
            setCurrentBookingState(null);

            const confirmationMsg = savedAiMessage || {
              _id: Date.now().toString(),
              role: 'ai',
              message:
                '🎉 Payment verified and booking confirmed successfully! Our healthcare specialist has been scheduled for your home visit.',
              paymentDetails: { paymentId, bookingId, amount },
              paymentStatus: 'success',
              createdAt: new Date().toISOString(),
            };

            setMessages((prev) => {
              const updated = prev.map((msg) => {
                if (
                  msg.paymentDetails?.paymentId === paymentId ||
                  msg.paymentId === paymentId
                ) {
                  return { ...msg, paymentStatus: 'success' };
                }
                return msg;
              });
              return [...updated, confirmationMsg];
            });
          } else {
            setPaymentSuccessful(true);
            setPaymentProcessing(false);
            setCurrentBookingState(null);
          }
        } catch (err) {
          console.error('Payment verification failed:', err);
          alert(
            'Payment verification failed. If money was deducted, please check your bookings.'
          );
        } finally {
          setPaymentProcessing(false);
        }
      },
      modal: {
        ondismiss: function () {
          setPaymentProcessing(false);
        },
      },
      prefill: {
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        contact: currentUser?.phone || '',
      },
      theme: {
        color: '#14B8A6',
      },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert(
        'Payment gateway failed to load. Please check your internet connection.'
      );
      setPaymentProcessing(false);
    }
  };

  handleRazorpayPaymentRef.current = handleRazorpayPayment;

  // 10-minute timer for payment expiration
  useEffect(() => {
    if (
      currentBookingState?.bookingStage === 'booking_success' &&
      !paymentSuccessful &&
      !paymentExpired &&
      currentBookingState.expiresAt
    ) {
      const interval = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.floor((currentBookingState.expiresAt - Date.now()) / 1000)
        );
        setPaymentTimeLeft(remaining);
        if (remaining <= 0) {
          setPaymentExpired(true);
          setCurrentBookingState(null); // dismiss card on expiration
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentBookingState, paymentSuccessful, paymentExpired]);

  // 5-second auto-open countdown for Razorpay
  useEffect(() => {
    if (
      currentBookingState?.bookingStage === 'booking_success' &&
      !paymentSuccessful &&
      !paymentExpired &&
      autoPayCountdown > 0
    ) {
      const timer = setTimeout(() => {
        setAutoPayCountdown((prev) => {
          if (prev <= 1) {
            handleRazorpayPaymentRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentBookingState, paymentSuccessful, paymentExpired, autoPayCountdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Quick suggestion prompts
  const suggestedPrompts = [
    {
      title: 'Book Home Nursing',
      desc: 'Certified nurses for IV drips, dressing, post-op care',
      prompt: 'I want to book a home nursing service for wound dressing.',
      icon: '🩺',
    },
    {
      title: 'Consult a Doctor',
      desc: 'General Physician, Cardiologist, Dermatologist',
      prompt: 'I need to consult a doctor for cold, cough and mild fever.',
      icon: '👨‍⚕️',
    },
    {
      title: 'Physiotherapy at Home',
      desc: 'Rehabilitation, back & joint pain relief',
      prompt: 'Can you show me available physiotherapy services at home?',
      icon: '🏃',
    },
    {
      title: 'Elderly Care Assistance',
      desc: 'Dedicated daily health support for senior citizens',
      prompt: 'What elderly care services do you offer at home?',
      icon: '👵',
    },
  ];

  // Helper to generate the next 7 selectable days
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const iso = `${yyyy}-${mm}-${dd}`;
      const label =
        i === 0
          ? 'Today'
          : i === 1
          ? 'Tomorrow'
          : d.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
      days.push({ iso, label });
    }
    return days;
  };

  // Filtered chats for sidebar
  const filteredChats = chats.filter((c) =>
    (c.title || 'Untitled Chat')
      .toLowerCase()
      .includes(searchFilter.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">
            Connecting to SwasthyaLink AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR (CONVERSATIONS) */}
      {/* ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <HiSparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">
                Swasthya<span className="text-teal-400">Link</span> AI
              </span>
              <span className="text-[10px] text-teal-400/80 uppercase font-semibold tracking-wider">
                Health Assistant
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-primary-600 hover:from-teal-400 hover:to-primary-500 text-white font-medium shadow-md shadow-teal-500/20 transition-all active:scale-[0.98]"
          >
            <FiPlus className="w-5 h-5" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search Chats */}
        <div className="px-4 pb-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/80 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Your Consultations
          </div>

          {loadingChats ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading chats...
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs px-4">
              {searchFilter
                ? 'No matching chats found.'
                : 'No past conversations yet. Start a new consultation above!'}
            </div>
          ) : (
            filteredChats.map((c) => {
              const isActive = c._id === activeChatId;
              return (
                <button
                  key={c._id}
                  onClick={() => selectChat(c)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                    isActive
                      ? 'bg-slate-800 text-teal-300 font-medium border border-teal-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <FiMessageSquare
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-teal-400'
                        : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />
                  <div className="flex-1 truncate text-xs">
                    <p className="truncate font-medium">{c.title}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 shadow-sm shadow-teal-400"></span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Sidebar Footer: User Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-semibold text-xs border border-teal-500/30">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            title="Back to SwasthyaLink"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Overlay on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        ></div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN CHAT CONTAINER */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between bg-slate-900/60 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm md:text-base font-semibold text-white flex items-center gap-2">
                <span>{activeChatTitle || 'SwasthyaLink Health AI'}</span>
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span
                  className={`w-2 h-2 rounded-full ${
                    socketConnected
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                ></span>
                <span>
                  {socketConnected ? 'AI Agent Connected' : 'Connecting Agent...'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/my-bookings')}
              className="text-xs font-medium text-slate-300 hover:text-teal-300 px-3 py-1.5 rounded-lg border border-slate-700/80 hover:border-teal-500/50 transition-all flex items-center gap-1.5"
            >
              <FiCalendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Bookings</span>
            </button>
            <button
              onClick={startNewChat}
              className="text-xs font-medium bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Consultation</span>
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          {loadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-slate-400">
                <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm">Loading chat messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            /* Empty State / Welcome Screen */
            <div className="max-w-2xl mx-auto py-12 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-primary-600 flex items-center justify-center shadow-xl shadow-teal-500/20 mb-6"
              >
                <HiSparkles className="w-8 h-8 text-white" />
              </motion.div>

              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                How can I assist your health today?
              </h1>
              <p className="text-slate-400 text-sm max-w-lg mb-8">
                I can help you query doctors, book certified home nursing &
                physiotherapy services, or answer healthcare questions.
              </p>

              {/* Quick suggestion prompt chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {suggestedPrompts.map((p, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSendMessage(p.prompt)}
                    className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 text-left transition-all shadow-sm group"
                  >
                    <div className="text-xl mb-2">{p.icon}</div>
                    <h3 className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {p.desc}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Thread */
            <div className="max-w-3xl mx-auto space-y-5">
              {messages.map((msg, index) => {
                const isAi = msg.role === 'ai';
                return (
                  <motion.div
                    key={msg._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 ${
                      isAi ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isAi && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-primary-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-teal-500/20">
                        <HiSparkles className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                        isAi
                          ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none shadow-md'
                          : 'bg-gradient-to-r from-teal-600 to-primary-600 text-white rounded-tr-none shadow-md shadow-teal-900/30 font-normal'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.message}</div>

                      {/* Payment Status Badges & Action Buttons */}
                      {isAi &&
                        (msg.paymentStatus ||
                          msg.paymentDetails?.paymentId ||
                          msg.message?.includes('Payment verified and booking confirmed')) && (
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                            {msg.paymentStatus === 'success' ||
                            msg.paymentStatus === 'COMPLETED' ||
                            msg.paymentStatus === 'CONFIRMED' ||
                            msg.message?.includes('Payment verified and booking confirmed') ? (
                              <div className="space-y-2">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                                  <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Payment Verified • Booking Confirmed</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const bId =
                                        msg.paymentDetails?.bookingId ||
                                        currentBookingState?.bookingId;
                                      if (bId) {
                                        navigate(`/confirmed-booking/${bId}`);
                                      } else {
                                        navigate('/my-bookings');
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-primary-600 hover:from-teal-400 hover:to-primary-500 text-white font-medium text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                                  >
                                    <FiCalendar className="w-3.5 h-3.5" />
                                    <span>View Booked Service Details</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => navigate('/my-bookings')}
                                    className="px-3 py-1.5 rounded-lg border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                                  >
                                    <FiCalendar className="w-3.5 h-3.5 text-teal-400" />
                                    <span>Go to My Bookings</span>
                                  </button>
                                </div>
                              </div>
                            ) : msg.paymentStatus === 'failed' ||
                              msg.paymentStatus === 'FAILED' ||
                              msg.paymentStatus === 'expired' ||
                              msg.paymentStatus === 'CANCELLED' ||
                              (msg.paymentExpiresAt &&
                                new Date(msg.paymentExpiresAt).getTime() <=
                                  Date.now()) ||
                              paymentExpired ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                                <FiXCircle className="w-3.5 h-3.5 text-rose-400" />
                                <span>Status: Payment Failed (Window Expired)</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                <span>Status: Payment Pending (Expires in 10 mins)</span>
                              </div>
                            )}
                          </div>
                        )}

                      <div
                        className={`text-[10px] mt-2 flex items-center gap-1 ${
                          isAi ? 'text-slate-500' : 'text-teal-100/70'
                        }`}
                      >
                        {msg.createdAt &&
                          new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </div>
                    </div>

                    {!isAi && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-teal-300 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                        {currentUser?.name
                          ? currentUser.name[0].toUpperCase()
                          : 'U'}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* AI Thinking Indicator */}
              {aiThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-primary-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-teal-500/20">
                    <HiSparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"></span>
                    <span
                      className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></span>
                    <span
                      className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></span>
                    <span className="text-xs text-slate-400 ml-1">
                      SwasthyaLink AI is thinking...
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ========================================================================= */}
              {/* 3. INTERACTIVE SERVICE BOOKING WIZARD (confirming_service) */}
              {/* ========================================================================= */}
              {currentBookingState?.bookingStage === 'confirming_service' &&
                currentBookingState?.available_services?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="my-4 rounded-2xl bg-slate-900/95 border border-teal-500/40 p-5 md:p-6 shadow-xl shadow-teal-950/40"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                          <FiActivity className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-base">
                            Select & Schedule Home Healthcare Service
                          </h3>
                          <p className="text-xs text-slate-400">
                            Choose service, preferred date/time slot and provide
                            address details
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCancelServiceSelection}
                        className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Step 1: Available Services Cards */}
                    <div className="mt-4">
                      <label className="text-xs font-semibold text-teal-300 block mb-2 uppercase tracking-wide">
                        1. Select Service
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentBookingState.available_services.map((svc) => {
                          const isSelected =
                            selectedService?.id === svc.id ||
                            selectedService?._id === svc.id;
                          return (
                            <div
                              key={svc.id || svc.name}
                              onClick={() => setSelectedService(svc)}
                              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-teal-950/40 border-teal-400 ring-1 ring-teal-400 shadow-md shadow-teal-500/10'
                                  : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-sm text-white">
                                  {svc.name}
                                </h4>
                                <span className="text-teal-400 font-bold text-sm">
                                  ₹{svc.price}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                {svc.description}
                              </p>
                              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                                <span>
                                  Duration: {svc.session_duration || '60 mins'}
                                </span>
                                {isSelected ? (
                                  <span className="text-teal-400 font-medium flex items-center gap-1">
                                    <FiCheckCircle className="w-3.5 h-3.5" />{' '}
                                    Selected
                                  </span>
                                ) : (
                                  <span className="text-slate-500 group-hover:text-slate-300">
                                    Click to select
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Date Selector (7 Days) */}
                    <div className="mt-5">
                      <label className="text-xs font-semibold text-teal-300 block mb-2 uppercase tracking-wide">
                        2. Select Date (Next 7 Days)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {getNext7Days().map((d) => {
                          const isSelected = selectedDate === d.iso;
                          return (
                            <button
                              key={d.iso}
                              type="button"
                              onClick={() => setSelectedDate(d.iso)}
                              className={`p-2.5 rounded-xl text-center border transition-all ${
                                isSelected
                                  ? 'bg-teal-500 text-white border-teal-400 font-semibold shadow-md shadow-teal-500/20'
                                  : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <p className="text-xs">{d.label}</p>
                              <p className="text-[10px] opacity-75 mt-0.5">
                                {d.iso.slice(5)}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 3: Time Slot Selector */}
                    <div className="mt-5">
                      <label className="text-xs font-semibold text-teal-300 block mb-2 uppercase tracking-wide">
                        3. Appointment Time
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { h: 9, m: 0, label: '09:00 AM' },
                          { h: 10, m: 30, label: '10:30 AM' },
                          { h: 12, m: 0, label: '12:00 PM' },
                          { h: 14, m: 0, label: '02:00 PM' },
                          { h: 15, m: 30, label: '03:30 PM' },
                          { h: 17, m: 0, label: '05:00 PM' },
                          { h: 18, m: 30, label: '06:30 PM' },
                        ].map((slot, idx) => {
                          const isSelected =
                            selectedHour === slot.h && selectedMinute === slot.m;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedHour(slot.h);
                                setSelectedMinute(slot.m);
                              }}
                              className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-teal-500/20 text-teal-300 border-teal-400 shadow-sm'
                                  : 'bg-slate-850 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <FiClock className="inline w-3 h-3 mr-1.5" />
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 4: Address Details */}
                    <div className="mt-5">
                      <label className="text-xs font-semibold text-teal-300 block mb-2 uppercase tracking-wide">
                        4. Service Address (Home Visit)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">
                            Flat / House / Building No.*
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Flat 302, Green Valley Apts"
                            value={addressData.flatNumber}
                            onChange={(e) =>
                              setAddressData({
                                ...addressData,
                                flatNumber: e.target.value,
                              })
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-400"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">
                            Locality / Street Area*
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Sector 15, Near City Hospital"
                            value={addressData.locality}
                            onChange={(e) =>
                              setAddressData({
                                ...addressData,
                                locality: e.target.value,
                              })
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-400"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">
                            City*
                          </label>
                          <input
                            type="text"
                            value={addressData.city}
                            onChange={(e) =>
                              setAddressData({
                                ...addressData,
                                city: e.target.value,
                              })
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-400"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-400 block mb-1">
                              State*
                            </label>
                            <input
                              type="text"
                              value={addressData.state}
                              onChange={(e) =>
                                setAddressData({
                                  ...addressData,
                                  state: e.target.value,
                                })
                              }
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-400"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1">
                              Pincode (6 digits)*
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="110001"
                              value={addressData.pincode}
                              onChange={(e) =>
                                setAddressData({
                                  ...addressData,
                                  pincode: e.target.value,
                                })
                              }
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {bookingFormError && (
                      <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <FiAlertCircle className="w-4 h-4 shrink-0" />
                        <span>{bookingFormError}</span>
                      </div>
                    )}

                    {/* Confirmation Button */}
                    <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleCancelServiceSelection}
                        className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
                      >
                        Cancel Selection
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmBookingSubmit}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-primary-600 hover:from-teal-400 hover:to-primary-500 text-white font-medium text-xs shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98] flex items-center gap-2"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        <span>Confirm & Book Service</span>
                      </button>
                    </div>
                  </motion.div>
                )}

              {/* ========================================================================= */}
              {/* 4. PAYMENT ACTION CARD (booking_success) */}
              {/* ========================================================================= */}
              {/* ========================================================================= */}
              {/* 4. ACTIVE PAYMENT CARD (Shown only during valid pending window) */}
              {/* ========================================================================= */}
              {currentBookingState?.bookingStage === 'booking_success' &&
                !paymentSuccessful &&
                !paymentExpired && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="my-4 rounded-2xl border p-6 shadow-xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/40 shadow-emerald-950/40"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                            <FiCheckCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-sm md:text-base font-semibold text-white leading-tight">
                              Booking created successfully! Complete payment to confirm.
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Complete payment within 10 minutes to lock your reserved time slot.
                            </p>
                          </div>
                        </div>

                        {/* 10-Minute Countdown Badge */}
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Expires in</span>
                          <span className="inline-block font-mono font-bold text-xs text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md shadow-xs">
                            ⏱️ {formatTime(paymentTimeLeft)}
                          </span>
                        </div>
                      </div>

                      {/* 5-Second Auto-Open Notice */}
                      {autoPayCountdown > 0 && (
                        <div className="mb-4 p-3 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-200 text-xs flex items-center justify-between animate-pulse">
                          <span>
                            🚀 Opening Razorpay checkout automatically in <strong>{autoPayCountdown}s</strong>...
                          </span>
                          <button
                            type="button"
                            onClick={() => setAutoPayCountdown(0)}
                            className="text-[11px] underline text-teal-300/80 hover:text-white ml-2 cursor-pointer"
                          >
                            Cancel auto-open
                          </button>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5 text-slate-300 mb-5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Order ID:</span>
                          <span className="font-mono text-emerald-400">
                            {currentBookingState.paymentId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Booking ID:</span>
                          <span className="font-mono text-slate-400">
                            {currentBookingState.bookingId}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-800 font-semibold text-sm text-white">
                          <span>Total Amount:</span>
                          <span className="text-emerald-400">
                            ₹
                            {currentBookingState.amount
                              ? currentBookingState.amount / 100
                              : selectedService?.price || 500}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleRazorpayPayment}
                        disabled={paymentProcessing}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                      >
                        <FiCreditCard className="w-5 h-5" />
                        <span>
                          {paymentProcessing
                            ? 'Opening Razorpay Gateway...'
                            : `Pay ₹${
                                currentBookingState.amount
                                  ? currentBookingState.amount / 100
                                  : selectedService?.price || 500
                              } Now via Razorpay`}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}

              {/* Confirmed Booking Success Card */}
              {paymentSuccessful && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="my-4 rounded-2xl border p-5 shadow-xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/40 shadow-emerald-950/40"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                      <FiCheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Payment Verified • Booking Confirmed!
                      </h3>
                      <p className="text-xs text-slate-400">
                        Your healthcare specialist has been scheduled. Track your booking and chat with your assigned nurse anytime.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/my-bookings')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-primary-600 hover:from-teal-400 hover:to-primary-500 text-white font-medium text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <FiCalendar className="w-4 h-4" />
                      <span>Go to My Bookings</span>
                    </button>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. BOTTOM INPUT BAR */}
        {/* ========================================================================= */}
        <div className="p-4 md:p-6 bg-slate-900/80 backdrop-blur-md border-t border-slate-800/80 shrink-0">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about health symptoms, doctor appointments, or book home nursing..."
                disabled={aiThinking}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl pl-5 pr-14 py-3.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 shadow-inner transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || aiThinking}
                className="absolute right-2 p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-primary-600 hover:from-teal-400 hover:to-primary-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-teal-500/20 active:scale-95"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
              <span>
                Powered by SwasthyaLink AI & Google Gemini • Medical information
                is informational
              </span>
              <span className="hidden sm:inline">Press Enter to send</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
