import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSend,
  FiPaperclip,
  FiMinus,
  FiX,
  FiCheck,
  FiClock,
  FiCalendar,
  FiMapPin,
  FiCreditCard,
  FiAlertCircle,
  FiCheckCircle,
  FiPlus,
  FiMessageSquare,
  FiSearch,
  FiChevronRight,
  FiArrowLeft,
  FiHome,
  FiXCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { connectAgentSocket, getAgentSocket, getAgentUrl } from '../services/agentSocket';
import roboDoctorImg from '../pictures/robo_head.png';

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

export default function FloatingChatbot() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [lastConfirmedBookingId, setLastConfirmedBookingId] = useState(null);

  // Open chatbot when custom event is triggered (e.g. from Navbar)
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('open-swasthyalink-chatbot', handleOpenChatbot);
    return () =>
      window.removeEventListener('open-swasthyalink-chatbot', handleOpenChatbot);
  }, []);

  // Chat state
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);

  // 3-Step Interactive Booking State
  const [currentBookingState, setCurrentBookingState] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Service, 2: Date & Time, 3: Address
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  
  // Address management
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new'); // 'new' or address._id
  const [addressMode, setAddressMode] = useState('saved'); // 'saved' or 'new'
  const [newAddress, setNewAddress] = useState({
    flatNumber: '',
    locality: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '',
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [bookingFormError, setBookingFormError] = useState('');

  // Payment state
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(600);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [paymentExpired, setPaymentExpired] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const handleRazorpayPaymentRef = useRef(null);

  // Time slots for Step 2
  const availableTimeSlots = [
    '09:00 AM',
    '10:30 AM',
    '12:00 PM',
    '02:30 PM',
    '04:00 PM',
    '05:30 PM',
    '07:00 PM',
  ];

  // 1. Initial Auth & Addresses check
  useEffect(() => {
    const checkAuthAndFetchAddresses = async () => {
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
          fetchSavedAddresses();
          connectAgentSocket(res.data?.token);
        }
      } catch (err) {
        console.log('FloatingChatbot: Guest mode or unauthenticated');
      }
    };
    checkAuthAndFetchAddresses();
  }, []);

  // Fetch saved addresses from backend API
  const fetchSavedAddresses = async () => {
    try {
      const res = await axios.get(`${MAIN_API_URL}/api/auth/addresses`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data?.success && res.data.addresses?.length > 0) {
        setSavedAddresses(res.data.addresses);
        setSelectedAddressId(res.data.addresses[0]._id);
        setAddressMode('saved');
      } else {
        setSavedAddresses([]);
        setAddressMode('new');
      }
    } catch (err) {
      console.log('Error fetching saved addresses:', err);
      setAddressMode('new');
    }
  };

  // 2. Initialize Socket and handlers
  useEffect(() => {
    const socket = connectAgentSocket();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    const onAgentReady = () => {
      setSocketConnected(true);
    };

    const onAgentMessage = (data) => {
      setAiThinking(false);
      if (data.chatId) {
        const newMsg = {
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
        setMessages((prev) => [...prev, newMsg]);

        if (data.bookingStage === 'confirming_service') {
          if (!data.available_services || data.available_services.length === 0) {
            // Treat 0 services as cancel / unavailable
            setCurrentBookingState(null);
            setBookingStep(1);
            setSelectedService(null);
          } else {
            setCurrentBookingState({
              bookingStage: 'confirming_service',
              available_services: data.available_services || [],
            });
            setBookingStep(1); // Start at Step 1
            setSelectedService(null); // Never auto-select: user must explicitly choose one service

            // Default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const yyyy = tomorrow.getFullYear();
            const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
            const dd = String(tomorrow.getDate()).padStart(2, '0');
            setSelectedDate(`${yyyy}-${mm}-${dd}`);
            fetchSavedAddresses();
          }
        } else if (data.bookingStage === 'booking_success' && data.paymentId) {
          const expiresAt = data.paymentExpiresAt
            ? new Date(data.paymentExpiresAt).getTime()
            : Date.now() + 10 * 60 * 1000;
          const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));

          if (data.paymentStatus === 'success') {
            setPaymentSuccessful(true);
            setPaymentExpired(false);
            setCurrentBookingState(null);
          } else if (remaining <= 0) {
            setPaymentSuccessful(false);
            setPaymentExpired(true);
            setPaymentTimeLeft(0);
            setCurrentBookingState(null);
          } else {
            setCurrentBookingState({
              bookingStage: 'booking_success',
              paymentId: data.paymentId,
              bookingId: data.bookingId,
              amount: data.amount,
              expiresAt,
              paymentStatus: 'pending',
            });
            setPaymentSuccessful(false);
            setPaymentExpired(false);
            setPaymentTimeLeft(remaining);
          }
        } else if (data.bookingStage === 'booking_failed') {
          setCurrentBookingState({ bookingStage: 'booking_failed' });
        } else {
          setCurrentBookingState(null);
        }
      }
    };

    const onAgentError = (err) => {
      setAiThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          role: 'ai',
          message: err?.message || 'I encountered an issue processing your request. Please try again.',
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

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('agentReady', onAgentReady);
      socket.off('agentMessage', onAgentMessage);
      socket.off('agentError', onAgentError);
    };
  }, []);

  // 3. Load user chats or setup default welcome message
  useEffect(() => {
    if (currentUser) {
      fetchUserChats();
    } else {
      initWelcomeMessage();
    }
  }, [currentUser]);

  // Restore booking and payment status from chat history / agent state
  const restoreBookingAndPaymentState = (chatMessages = [], savedState = null) => {
    const essentials = savedState?.service_booking_essentials;

    // Find the latest message containing booking or payment details
    const paymentMsg = [...chatMessages]
      .reverse()
      .find(
        (m) =>
          m.paymentDetails?.paymentId ||
          m.paymentId ||
          m.paymentStatus ||
          m.bookingId ||
          m.message?.includes('Payment verified and booking confirmed') ||
          m.message?.includes('Booking created successfully')
      );

    // Check if payment was confirmed/successful (handling database enums: 'success', 'COMPLETED', 'CONFIRMED')
    const isPaymentSuccessful =
      paymentMsg?.paymentStatus === 'success' ||
      paymentMsg?.paymentStatus === 'COMPLETED' ||
      paymentMsg?.paymentStatus === 'CONFIRMED' ||
      essentials?.paymentStatus === 'success' ||
      essentials?.paymentStatus === 'COMPLETED' ||
      essentials?.paymentStatus === 'CONFIRMED' ||
      chatMessages.some(
        (m) =>
          m.paymentStatus === 'success' ||
          m.paymentStatus === 'COMPLETED' ||
          m.paymentStatus === 'CONFIRMED' ||
          m.message?.includes('Payment verified and booking confirmed')
      );

    if (isPaymentSuccessful) {
      setPaymentSuccessful(true);
      setPaymentExpired(false);
      setPaymentTimeLeft(0);
      const bId =
        paymentMsg?.paymentDetails?.bookingId ||
        paymentMsg?.bookingId ||
        essentials?.bookingId;
      if (bId) setLastConfirmedBookingId(bId);
      // Payment already confirmed! Do NOT show bottom payment card
      setCurrentBookingState(null);
      return;
    }

    // In-flight service selection
    if (
      essentials?.bookingStage === 'confirming_service' &&
      essentials?.available_services?.length > 0
    ) {
      setCurrentBookingState({
        bookingStage: 'confirming_service',
        available_services: essentials.available_services,
      });
      setSelectedService(essentials.available_services[0]);
      return;
    }

    // Check if there is an active/pending payment
    const isPendingPayment =
      (essentials?.bookingStage === 'booking_success' && essentials?.paymentId) ||
      (paymentMsg &&
        (paymentMsg.paymentDetails?.paymentId || paymentMsg.paymentId) &&
        (paymentMsg.paymentStatus === 'pending' ||
          paymentMsg.paymentStatus === 'PENDING' ||
          paymentMsg.paymentStatus === 'PAYMENT_PENDING' ||
          !paymentMsg.paymentStatus));

    if (isPendingPayment) {
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
        paymentMsg?.amount ||
        50000;

      const expiresAtRaw =
        paymentMsg?.paymentExpiresAt ||
        essentials?.paymentExpiresAt ||
        (paymentMsg?.createdAt
          ? new Date(paymentMsg.createdAt).getTime() + 10 * 60 * 1000
          : null);

      const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).getTime() : 0;
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

      if (remaining > 0) {
        // Still within payment window: keep status pending & show payment option
        setCurrentBookingState({
          bookingStage: 'booking_success',
          paymentId,
          bookingId,
          amount,
          createdAt: paymentMsg?.createdAt
            ? new Date(paymentMsg.createdAt).getTime()
            : now,
          expiresAt,
          paymentStatus: 'pending',
        });
        setPaymentSuccessful(false);
        setPaymentExpired(false);
        setPaymentTimeLeft(remaining);
      } else {
        // Current time > expire time: mark as failed on frontend
        setCurrentBookingState(null);
        setPaymentSuccessful(false);
        setPaymentExpired(true);
        setPaymentTimeLeft(0);
      }
    } else {
      setCurrentBookingState(null);
      setPaymentSuccessful(false);
      setPaymentExpired(false);
      setPaymentTimeLeft(0);
    }
  };

  const fetchUserChats = async () => {
    setLoadingChats(true);
    try {
      const res = await axios.get(`${AGENT_API_URL}/api/chat/my-chats`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data?.success && res.data.chats?.length > 0) {
        setChats(res.data.chats);
        const latestChat = res.data.chats[0];
        setActiveChatId(latestChat._id);
        // Load messages for latest chat
        const msgRes = await axios.get(
          `${AGENT_API_URL}/api/chat/${latestChat._id}/messages`,
          {
            withCredentials: true,
            headers: getAuthHeaders(),
          }
        );
        if (msgRes.data?.success && msgRes.data.messages?.length > 0) {
          setMessages(msgRes.data.messages);
          restoreBookingAndPaymentState(msgRes.data.messages, msgRes.data.state);
        } else {
          initWelcomeMessage();
        }
      } else {
        initWelcomeMessage();
      }
    } catch (err) {
      initWelcomeMessage();
    } finally {
      setLoadingChats(false);
    }
  };

  const initWelcomeMessage = () => {
    const displayName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Abhi';
    setMessages([
      {
        _id: 'welcome-msg',
        role: 'ai',
        message: `Hi ${displayName}! 👋\nI'm SwasthyaLink AI, your health assistant.\nHow can I help you today?`,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  // Start a fresh conversation
  const handleStartNewChat = () => {
    setActiveChatId(null);
    setShowHistory(false);
    setCurrentBookingState(null);
    setBookingStep(1);
    setSelectedService(null);
    setPaymentSuccessful(false);
    setPaymentExpired(false);
    initWelcomeMessage();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Select a past chat
  const handleSelectChat = async (chat) => {
    setActiveChatId(chat._id);
    setShowHistory(false);
    setCurrentBookingState(null);
    setBookingStep(1);
    setSelectedService(null);

    try {
      const res = await axios.get(
        `${AGENT_API_URL}/api/chat/${chat._id}/messages`,
        {
          withCredentials: true,
          headers: getAuthHeaders(),
        }
      );
      if (res.data?.success && res.data.messages?.length > 0) {
        setMessages(res.data.messages);
        restoreBookingAndPaymentState(res.data.messages, res.data.state);
      } else {
        initWelcomeMessage();
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  // Scroll to bottom on updates
  useEffect(() => {
    if (isOpen && !isMinimized && !showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, aiThinking, currentBookingState, isOpen, isMinimized, showHistory, bookingStep]);

  // When chatbot is opened or reopened, verify real-time payment expiration
  useEffect(() => {
    if (isOpen && currentBookingState?.expiresAt) {
      const now = Date.now();
      if (now >= currentBookingState.expiresAt) {
        setPaymentExpired(true);
        setCurrentBookingState(null);
        setPaymentTimeLeft(0);
      } else {
        const remaining = Math.max(
          0,
          Math.floor((currentBookingState.expiresAt - now) / 1000)
        );
        setPaymentTimeLeft(remaining);
      }
    }
  }, [isOpen, currentBookingState?.expiresAt]);

  // Payment Countdown Timer
  useEffect(() => {
    if (
      !currentBookingState?.expiresAt ||
      currentBookingState.bookingStage !== 'booking_success' ||
      paymentSuccessful ||
      paymentExpired
    ) {
      return;
    }

    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((currentBookingState.expiresAt - Date.now()) / 1000)
      );
      setPaymentTimeLeft(remaining);

      if (remaining <= 0) {
        setPaymentExpired(true);
        setCurrentBookingState(null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentBookingState, paymentSuccessful, paymentExpired]);

  // Handle send message
  const handleSendMessage = async (textCustom = null) => {
    const textToSend = (textCustom || inputMessage).trim();
    if (!textToSend || aiThinking) return;

    const socket = getAgentSocket();
    if (!socket) return;

    setInputMessage('');
    setAiThinking(true);

    let currentChatId = activeChatId;

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
          setActiveChatId(currentChatId);
          fetchUserChats();
        }
      } catch (err) {
        console.error('Failed to create chat session:', err);
      }
    }

    // Append local message immediately
    const userMsgObj = {
      _id: Date.now().toString(),
      role: 'user',
      message: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsgObj]);

    socket.emit('userMessage', {
      userMessage: textToSend,
      chatId: currentChatId || 'temp-' + Date.now(),
      bookingStage:
        currentBookingState?.bookingStage === 'confirming_service'
          ? 'chat'
          : currentBookingState?.bookingStage || 'chat',
    });
  };

  // Cancel service booking
  const handleCancelBooking = () => {
    const socket = getAgentSocket();
    if (socket && activeChatId) {
      socket.emit('userMessage', {
        userMessage: 'Cancel service selection',
        chatId: activeChatId,
        bookingStage: 'booking_failed',
      });
    }
    setCurrentBookingState(null);
    setBookingStep(1);
    setSelectedService(null);
  };

  // Submit 3-Step Booking Confirmation
  const handleFinalBookingSubmit = async () => {
    setBookingFormError('');
    if (!selectedService) {
      setBookingFormError('Please select a service.');
      setBookingStep(1);
      return;
    }
    if (!selectedDate) {
      setBookingFormError('Please select a valid date.');
      setBookingStep(2);
      return;
    }

    let finalAddressStr = '';
    let addressObj = null;

    if (addressMode === 'saved' && savedAddresses.length > 0) {
      const chosenAddr = savedAddresses.find((a) => a._id === selectedAddressId);
      if (!chosenAddr) {
        setBookingFormError('Please select a saved address.');
        return;
      }
      finalAddressStr = `${chosenAddr.flatNumber}, ${chosenAddr.locality}, ${chosenAddr.city}, ${chosenAddr.state} - ${chosenAddr.pincode}`;
      addressObj = {
        flatNumber: chosenAddr.flatNumber || '',
        locality: chosenAddr.locality || '',
        city: chosenAddr.city || '',
        state: chosenAddr.state || '',
        pincode: chosenAddr.pincode || '',
      };
    } else {
      // Validate new address
      if (!newAddress.flatNumber.trim()) {
        setBookingFormError('Flat / House number is required.');
        return;
      }
      if (!newAddress.locality.trim()) {
        setBookingFormError('Locality / Street is required.');
        return;
      }
      if (!newAddress.city.trim()) {
        setBookingFormError('City is required.');
        return;
      }
      if (!newAddress.state.trim()) {
        setBookingFormError('State is required.');
        return;
      }
      if (!/^[0-9]{6}$/.test(newAddress.pincode.trim())) {
        setBookingFormError('Please enter a valid 6-digit Indian pincode.');
        return;
      }

      // Save new address to backend via POST /api/auth/address
      setSavingAddress(true);
      try {
        const addRes = await axios.post(
          `${MAIN_API_URL}/api/auth/address`,
          {
            flatNumber: newAddress.flatNumber.trim(),
            locality: newAddress.locality.trim(),
            city: newAddress.city.trim(),
            state: newAddress.state.trim(),
            pincode: newAddress.pincode.trim(),
          },
          { withCredentials: true }
        );

        if (addRes.data?.success && addRes.data.address) {
          // Add to local list of saved addresses
          setSavedAddresses((prev) => [...prev, addRes.data.address]);
          setSelectedAddressId(addRes.data.address._id);
        }
      } catch (saveErr) {
        console.error('Failed to save address to backend profile:', saveErr);
        // Continue with booking even if saving profile copy fails
      } finally {
        setSavingAddress(false);
      }

      finalAddressStr = `${newAddress.flatNumber.trim()}, ${newAddress.locality.trim()}, ${newAddress.city.trim()}, ${newAddress.state.trim()} - ${newAddress.pincode.trim()}`;
      addressObj = {
        flatNumber: newAddress.flatNumber.trim(),
        locality: newAddress.locality.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        pincode: newAddress.pincode.trim(),
      };
    }

    const socket = getAgentSocket();
    if (!socket || !activeChatId) {
      setBookingFormError('Connection issue. Please retry.');
      return;
    }

    setAiThinking(true);
    setCurrentBookingState(null);
    setBookingStep(1);

    // Parse startHour and startMinute from selectedTimeSlot (e.g. "10:30 AM", "02:30 PM")
    let startHour = 10;
    let startMinute = 0;
    if (selectedTimeSlot) {
      const parts = selectedTimeSlot.split(' ');
      if (parts.length === 2) {
        const [hStr, mStr] = parts[0].split(':');
        let h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10) || 0;
        if (parts[1].toUpperCase() === 'PM' && h < 12) h += 12;
        if (parts[1].toUpperCase() === 'AM' && h === 12) h = 0;
        startHour = h;
        startMinute = m;
      }
    }

    const userSummary = `Booked ${selectedService.name} on ${selectedDate} at ${selectedTimeSlot} at address: ${finalAddressStr}`;
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        role: 'user',
        message: userSummary,
        createdAt: new Date().toISOString(),
      },
    ]);

    socket.emit('userMessage', {
      userMessage: `Confirm booking for ${selectedService.name}`,
      chatId: activeChatId,
      bookingStage: 'booking',
      serviceId: selectedService._id || selectedService.id,
      date: selectedDate,
      startHour,
      startMinute,
      address: addressObj,
    });
  };

  // Razorpay payment
  const handleRazorpayPayment = () => {
    if (paymentSuccessful || paymentExpired) return;
    if (!currentBookingState?.paymentId || !currentBookingState?.bookingId) {
      alert('Missing payment details.');
      return;
    }

    const { paymentId, bookingId, amount } = currentBookingState;
    setPaymentProcessing(true);

    const options = {
      key: 'rzp_test_RrZ4Isj9Rfj8Dz',
      amount: amount || 50000,
      currency: 'INR',
      order_id: paymentId,
      name: 'SwasthyaLink',
      description: 'Home Healthcare Service Confirmation',
      handler: async function (paymentResponse) {
        try {
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
            verifyResponse.data.message === 'Payment verified and booking confirmed'
          ) {
            try {
              await axios.post(
                `${AGENT_API_URL}/api/chat/payment-success`,
                {
                  chatId: activeChatId,
                  paymentId,
                  bookingId,
                },
                {
                  withCredentials: true,
                  headers: getAuthHeaders(),
                }
              );
            } catch (notifyErr) {
              console.error('Agent payment notify error:', notifyErr);
            }

            setPaymentSuccessful(true);
            setPaymentExpired(false);
            setLastConfirmedBookingId(bookingId);
            setCurrentBookingState(null);

            setMessages((prev) => [
              ...prev.map((msg) =>
                msg.paymentDetails?.paymentId === paymentId ||
                msg.paymentId === paymentId ||
                msg.bookingId === bookingId
                  ? { ...msg, paymentStatus: 'success' }
                  : msg
              ),
              {
                _id: Date.now().toString(),
                role: 'ai',
                message:
                  '🎉 Payment verified and booking confirmed successfully! Our healthcare specialist has been scheduled for your home visit.',
                paymentStatus: 'success',
                bookingId,
                createdAt: new Date().toISOString(),
              },
            ]);
          }
        } catch (verifyError) {
          console.error('Payment verification failed:', verifyError);
          alert('Payment verification failed. Please check with support.');
        } finally {
          setPaymentProcessing(false);
        }
      },
      prefill: {
        name: currentUser?.name || 'Valued Patient',
        email: currentUser?.email || 'patient@example.com',
        contact: currentUser?.phone || '9999999999',
      },
      theme: {
        color: '#0D9488',
      },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    }
  };
  handleRazorpayPaymentRef.current = handleRazorpayPayment;

  // Format time helper (e.g. 5:20 PM)
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Filtered past chats for history drawer
  const filteredChats = chats.filter((c) =>
    (c.title || 'Consultation')
      .toLowerCase()
      .includes(historySearch.toLowerCase())
  );

  const isStaffRoute = ['/doctor', '/nurse', '/cashier', '/admin'].some(
    (prefix) => location.pathname.startsWith(prefix)
  );

  if (isStaffRoute) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* 1. EXPANDED / MINIMIZED CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              height: isMinimized ? '74px' : '610px',
            }}
            exit={{ opacity: 0, scale: 0.85, y: 35 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-[390px] sm:w-[420px] max-w-[calc(100vw-32px)] max-h-[88vh] mb-3 bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(13,148,136,0.28),0_10px_30px_-10px_rgba(0,0,0,0.12)] border border-teal-100/80 overflow-hidden flex flex-col transition-all duration-300 relative"
            style={{
              backgroundImage:
                'radial-gradient(circle at 100% 0%, rgba(204,251,241,0.45) 0%, transparent 40%), radial-gradient(circle at 0% 100%, rgba(204,251,241,0.3) 0%, transparent 35%)',
            }}
          >
            {/* CHAT HEADER */}
            <div className="px-4 py-3 bg-gradient-to-b from-teal-50/70 to-white/90 border-b border-teal-50 flex items-center justify-between relative backdrop-blur-sm select-none">
              {/* Left Profile */}
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-100/80 to-cyan-50 border border-teal-200/60 p-1 flex items-center justify-center shadow-xs overflow-hidden">
                    <img
                      src={roboDoctorImg}
                      alt="SwasthyaLink Robot AI"
                      className="w-full h-full object-contain filter drop-shadow-xs scale-110"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-[15px] leading-tight flex items-center gap-1.5">
                    SwasthyaLink AI
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      Online
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 font-normal leading-none mt-0.5">
                    Your Health Assistant
                  </p>
                </div>
              </div>

              {/* Right Side: Action Controls & Handwritten Text */}
              <div className="flex flex-col items-end">
                {/* Header Window Buttons */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  {/* Past Conversations Button */}
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    title="Conversation History"
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      showHistory
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700'
                    }`}
                  >
                    <FiMessageSquare className="w-3.5 h-3.5" />
                  </button>

                  {/* Start New Chat Button */}
                  <button
                    onClick={handleStartNewChat}
                    title="Start New Conversation"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>

                  {/* Minimize Button */}
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    title={isMinimized ? 'Expand' : 'Minimize'}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <FiMinus className="w-3.5 h-3.5" />
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Handwritten script note: "Here to help ♡" */}
                {!isMinimized && !showHistory && (
                  <div className="font-handwritten text-[#0D9488] text-[19px] sm:text-[21px] font-bold -rotate-6 tracking-wide select-none leading-none mt-1 mr-0.5">
                    Here to help ♡
                  </div>
                )}
              </div>
            </div>

            {/* CONVERSATION HISTORY DRAWER OVERLAY */}
            <AnimatePresence>
              {showHistory && !isMinimized && (
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="absolute inset-x-0 top-[68px] bottom-0 bg-white/98 backdrop-blur-md z-40 p-4 flex flex-col space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Past Conversations
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Select a past consultation to resume
                      </p>
                    </div>
                    <button
                      onClick={handleStartNewChat}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                    >
                      <FiPlus className="w-3 h-3" /> New Chat
                    </button>
                  </div>

                  {/* Search filter */}
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Search consultations..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-teal-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Chat List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {loadingChats ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        Loading conversations...
                      </div>
                    ) : filteredChats.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                        <FiMessageSquare className="w-6 h-6 text-slate-300" />
                        <span>No previous consultations found.</span>
                      </div>
                    ) : (
                      filteredChats.map((chat) => (
                        <button
                          key={chat._id}
                          onClick={() => handleSelectChat(chat)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                            activeChatId === chat._id
                              ? 'border-teal-500 bg-teal-50/80 text-teal-950 font-semibold shadow-xs'
                              : 'border-slate-100 hover:border-slate-200 text-slate-700 bg-slate-50/40'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className="truncate text-xs font-medium">
                              {chat.title || 'Consultation'}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {chat.createdAt
                                ? new Date(chat.createdAt).toLocaleDateString(
                                    [],
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                    }
                                  )
                                : 'Recent'}
                            </span>
                          </div>
                          <FiChevronRight className="text-slate-400 w-3.5 h-3.5 flex-shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CHAT BODY */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 scroll-smooth">
                  {/* Today Divider */}
                  <div className="flex justify-center my-1">
                    <span className="text-[10.5px] font-medium text-slate-400 bg-slate-100/90 px-3 py-0.5 rounded-full tracking-wider uppercase">
                      Today
                    </span>
                  </div>

                  {/* Messages Stream */}
                  {messages.map((msg, idx) => {
                    const isAi = msg.role === 'ai';
                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${
                          isAi ? 'items-start' : 'items-end'
                        }`}
                      >
                        <div
                          className={`flex items-start gap-2.5 max-w-[84%] ${
                            isAi ? '' : 'flex-row-reverse'
                          }`}
                        >
                          {/* AI Avatar */}
                          {isAi && (
                            <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-100/90 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs mt-0.5">
                              <img
                                src={roboDoctorImg}
                                alt="AI Avatar"
                                className="w-full h-full object-contain scale-110"
                              />
                            </div>
                          )}

                          {/* Chat Bubble */}
                          <div>
                            <div
                              className={`p-3.5 text-[13.5px] leading-relaxed shadow-xs ${
                                isAi
                                  ? 'bg-white border border-slate-100/90 text-slate-800 rounded-2xl rounded-tl-sm'
                                  : 'bg-[#E6F7F5] border border-teal-100/70 text-teal-950 font-normal rounded-2xl rounded-tr-sm'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.message}</p>

                              {/* Action status & buttons for AI messages with booking/payment */}
                              {isAi && (() => {
                                const hasPaymentInfo = Boolean(
                                  msg.paymentStatus ||
                                  msg.paymentDetails?.paymentId ||
                                  msg.paymentId ||
                                  msg.bookingId ||
                                  msg.message?.includes('Payment verified and booking confirmed') ||
                                  msg.message?.includes('Booking created successfully')
                                );
                                if (!hasPaymentInfo) return null;

                                const isSuccess =
                                  msg.paymentStatus === 'success' ||
                                  msg.paymentStatus === 'COMPLETED' ||
                                  msg.paymentStatus === 'CONFIRMED' ||
                                  msg.message?.includes('Payment verified and booking confirmed') ||
                                  (paymentSuccessful &&
                                    (lastConfirmedBookingId === (msg.bookingId || msg.paymentDetails?.bookingId)));

                                const expiresTime = msg.paymentExpiresAt
                                  ? new Date(msg.paymentExpiresAt).getTime()
                                  : (msg.createdAt ? new Date(msg.createdAt).getTime() + 10 * 60 * 1000 : 0);

                                const isExpired =
                                  !isSuccess &&
                                  (msg.paymentStatus === 'failed' ||
                                    msg.paymentStatus === 'FAILED' ||
                                    msg.paymentStatus === 'expired' ||
                                    msg.paymentStatus === 'CANCELLED' ||
                                    (expiresTime > 0 && expiresTime <= Date.now()) ||
                                    (paymentExpired &&
                                      (currentBookingState?.bookingId === (msg.bookingId || msg.paymentDetails?.bookingId))));

                                const isPending = !isSuccess && !isExpired;

                                if (isSuccess) {
                                  return (
                                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                                        <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Payment Verified • Booking Confirmed</span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                        <button
                                          type="button"
                                          onClick={() => navigate('/my-bookings')}
                                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                                        >
                                          <FiCalendar className="w-3.5 h-3.5" />
                                          <span>Go to My Bookings</span>
                                        </button>
                                        {(msg.bookingId || msg.paymentDetails?.bookingId || lastConfirmedBookingId) && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              navigate(
                                                `/confirmed-booking/${
                                                  msg.bookingId || msg.paymentDetails?.bookingId || lastConfirmedBookingId
                                                }`
                                              )
                                            }
                                            className="px-2.5 py-1.5 rounded-xl border border-teal-200 hover:bg-teal-50 text-teal-800 font-medium text-xs transition-colors cursor-pointer"
                                          >
                                            View Details
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }

                                if (isExpired) {
                                  return (
                                    <div className="mt-3 pt-2.5 border-t border-rose-100/80 space-y-1.5">
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
                                        <FiXCircle className="w-3.5 h-3.5 text-rose-600" />
                                        <span>Status: Payment Failed (Window Expired)</span>
                                      </div>
                                      <p className="text-[11px] text-rose-600 leading-tight">
                                        The 10-minute payment window has expired. Booking was cancelled.
                                      </p>
                                    </div>
                                  );
                                }

                                if (isPending) {
                                  return (
                                    <div className="mt-3 pt-2.5 border-t border-amber-100/80 space-y-1.5">
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                        <FiClock className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Status: Payment Pending (Expires in 10 mins)</span>
                                      </div>
                                      <p className="text-[11px] text-amber-700 leading-tight">
                                        Please complete payment using the card below to confirm your booking.
                                      </p>
                                    </div>
                                  );
                                }

                                return null;
                              })()}
                            </div>

                            {/* Timestamp & double checkmarks */}
                            <div
                              className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 ${
                                isAi ? 'ml-1 justify-start' : 'mr-1 justify-end'
                              }`}
                            >
                              <span>
                                {msg.createdAt
                                  ? formatTime(msg.createdAt)
                                  : '5:20 PM'}
                              </span>
                              {!isAi && (
                                <span className="text-teal-600 font-bold tracking-tighter flex items-center">
                                  <FiCheck className="w-2.5 h-2.5 -mr-1 text-teal-500" />
                                  <FiCheck className="w-2.5 h-2.5 text-teal-500" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* AI Thinking Indicator */}
                  {aiThinking && (
                    <div className="flex items-start gap-2.5 max-w-[85%]">
                      <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-100 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden mt-0.5">
                        <img
                          src={roboDoctorImg}
                          alt="AI"
                          className="w-full h-full object-contain scale-110"
                        />
                      </div>
                      <div className="bg-white border border-slate-100 shadow-xs rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        ></span>
                        <span
                          className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        ></span>
                        <span
                          className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        ></span>
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 3-STEP SERVICE BOOKING WIZARD */}
                  {/* ========================================================= */}
                  {currentBookingState?.bookingStage === 'confirming_service' && (
                    <div className="bg-white border border-teal-100 rounded-2xl p-4 shadow-sm space-y-3.5 relative overflow-hidden">
                      {/* Step Progress Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-teal-50">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {bookingStep}
                          </div>
                          <span className="text-xs font-bold text-teal-950">
                            {bookingStep === 1 && 'Step 1: Choose Service'}
                            {bookingStep === 2 && 'Step 2: Date & Time'}
                            {bookingStep === 3 && 'Step 3: Delivery Address'}
                          </span>
                        </div>
                        {/* Step indicator pills */}
                        <div className="flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              bookingStep === 1
                                ? 'bg-teal-600'
                                : 'bg-teal-200'
                            }`}
                          />
                          <span
                            className={`w-2 h-2 rounded-full ${
                              bookingStep === 2
                                ? 'bg-teal-600'
                                : 'bg-teal-200'
                            }`}
                          />
                          <span
                            className={`w-2 h-2 rounded-full ${
                              bookingStep === 3
                                ? 'bg-teal-600'
                                : 'bg-teal-200'
                            }`}
                          />
                        </div>
                      </div>

                      {/* --- STEP 1: SERVICE SELECTION --- */}
                      {bookingStep === 1 && (
                        <div className="space-y-2.5">
                          <p className="text-[11px] text-slate-500 font-medium">
                            Choose 1 service from the options below:
                          </p>
                          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                            {currentBookingState.available_services?.map((svc) => {
                              const svcId = svc._id || svc.id;
                              const selectedId = selectedService
                                ? selectedService._id || selectedService.id
                                : null;
                              const isSelected = Boolean(
                                selectedId && String(selectedId) === String(svcId)
                              );
                              return (
                                <button
                                  key={svcId || svc.name}
                                  type="button"
                                  onClick={() => setSelectedService(svc)}
                                  className={`p-2.5 rounded-xl text-left border text-xs transition-all flex items-center justify-between cursor-pointer ${
                                    isSelected
                                      ? 'border-teal-500 bg-teal-50/90 text-teal-950 shadow-xs ring-2 ring-teal-500/20'
                                      : 'border-slate-200 hover:border-teal-300 text-slate-700 bg-white hover:bg-slate-50'
                                  }`}
                                >
                                  <div>
                                    <p className="font-semibold">{svc.name}</p>
                                    <p className="text-[10px] text-slate-400">
                                      {svc.session_duration || svc.duration || '60 mins'} • Home Visit
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold text-teal-700 text-sm">
                                      ₹{svc.price}
                                    </span>
                                    {isSelected ? (
                                      <span className="block text-[10px] text-teal-600 font-semibold">
                                        Selected ✓
                                      </span>
                                    ) : (
                                      <span className="block text-[10px] text-slate-400">
                                        Click to select
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {!selectedService && (
                            <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                              <FiAlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Please tap any 1 service above to select it.</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleCancelBooking}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={!selectedService}
                              onClick={() => setBookingStep(2)}
                              className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            >
                              {selectedService ? 'Next: Date & Time →' : 'Select a Service to Continue'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* --- STEP 2: DATE & TIME SELECTION --- */}
                      {bookingStep === 2 && (
                        <div className="space-y-3">
                          {/* Selected Service Recap */}
                          <div className="p-2 rounded-xl bg-teal-50/60 border border-teal-100 text-xs flex items-center justify-between">
                            <span className="font-semibold text-teal-900 truncate">
                              {selectedService?.name}
                            </span>
                            <span className="font-bold text-teal-700">
                              ₹{selectedService?.price}
                            </span>
                          </div>

                          {/* Date input */}
                          <div>
                            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                              <FiCalendar className="text-teal-600" /> Select Date
                            </label>
                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                            />
                          </div>

                          {/* Time Slots */}
                          <div>
                            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                              <FiClock className="text-teal-600" /> Preferred Slot
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {availableTimeSlots.map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setSelectedTimeSlot(slot)}
                                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                                    selectedTimeSlot === slot
                                      ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                                      : 'border-slate-200 text-slate-600 hover:border-teal-300'
                                  }`}
                                >
                                  {slot}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Step 2 Actions */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setBookingStep(1)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <FiArrowLeft /> Back
                            </button>
                            <button
                              type="button"
                              disabled={!selectedDate}
                              onClick={() => setBookingStep(3)}
                              className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              Next: Address →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* --- STEP 3: SAVED & NEW ADDRESS SELECTION --- */}
                      {bookingStep === 3 && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-500">
                            Where should the specialist visit?
                          </p>

                          {/* Option Tabs / Mode Selector */}
                          {savedAddresses.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                              <button
                                type="button"
                                onClick={() => setAddressMode('saved')}
                                className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                  addressMode === 'saved'
                                    ? 'bg-white text-teal-900 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                              >
                                Saved ({savedAddresses.length})
                              </button>
                              <button
                                type="button"
                                onClick={() => setAddressMode('new')}
                                className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                  addressMode === 'new'
                                    ? 'bg-white text-teal-900 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                              >
                                + Add New
                              </button>
                            </div>
                          )}

                          {/* List of Saved Addresses */}
                          {addressMode === 'saved' && savedAddresses.length > 0 && (
                            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                              {savedAddresses.map((addr) => {
                                const isSelected = selectedAddressId === addr._id;
                                return (
                                  <div
                                    key={addr._id}
                                    onClick={() => setSelectedAddressId(addr._id)}
                                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                                      isSelected
                                        ? 'border-teal-500 bg-teal-50/70 text-teal-950 shadow-xs'
                                        : 'border-slate-100 hover:border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <div className="mt-0.5">
                                      <div
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                          isSelected
                                            ? 'border-teal-600 bg-teal-600 text-white'
                                            : 'border-slate-300'
                                        }`}
                                      >
                                        {isSelected && (
                                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-slate-800">
                                        {addr.flatNumber}, {addr.locality}
                                      </p>
                                      <p className="text-[10.5px] text-slate-500">
                                        {addr.city}, {addr.state} - {addr.pincode}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Shortcut to switch to new address */}
                              <button
                                type="button"
                                onClick={() => setAddressMode('new')}
                                className="w-full py-1.5 text-center text-[11px] text-teal-600 font-semibold hover:underline cursor-pointer"
                              >
                                + Or enter a new address
                              </button>
                            </div>
                          )}

                          {/* New Address Form */}
                          {addressMode === 'new' && (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500">
                                    Flat / House No. *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Flat 304, Tower A"
                                    value={newAddress.flatNumber}
                                    onChange={(e) =>
                                      setNewAddress({
                                        ...newAddress,
                                        flatNumber: e.target.value,
                                      })
                                    }
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500">
                                    Pincode (6 digits) *
                                  </label>
                                  <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="e.g. 110016"
                                    value={newAddress.pincode}
                                    onChange={(e) =>
                                      setNewAddress({
                                        ...newAddress,
                                        pincode: e.target.value.replace(/\D/g, ''),
                                      })
                                    }
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-slate-500">
                                  Locality / Area / Street *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Green Park Main"
                                  value={newAddress.locality}
                                  onChange={(e) =>
                                    setNewAddress({
                                      ...newAddress,
                                      locality: e.target.value,
                                    })
                                  }
                                  className="w-full text-xs p-1.5 border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500">
                                    City *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. New Delhi"
                                    value={newAddress.city}
                                    onChange={(e) =>
                                      setNewAddress({
                                        ...newAddress,
                                        city: e.target.value,
                                      })
                                    }
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500">
                                    State *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Delhi"
                                    value={newAddress.state}
                                    onChange={(e) =>
                                      setNewAddress({
                                        ...newAddress,
                                        state: e.target.value,
                                      })
                                    }
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {bookingFormError && (
                            <p className="text-[10.5px] text-rose-500 font-medium">
                              {bookingFormError}
                            </p>
                          )}

                          {/* Step 3 Actions */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setBookingStep(2)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <FiArrowLeft /> Back
                            </button>
                            <button
                              type="button"
                              disabled={savingAddress}
                              onClick={handleFinalBookingSubmit}
                              className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                            >
                              <FiCheck /> Confirm & Book Service
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Booking State (Payment Window Card) */}
                  {currentBookingState?.bookingStage === 'booking_success' &&
                    !paymentSuccessful &&
                    !paymentExpired && (
                      <div className="bg-gradient-to-br from-teal-50 to-emerald-50/50 border border-teal-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                            <FiCreditCard className="text-teal-600" /> Complete
                            Payment
                          </span>
                          <span className="text-xs font-bold text-teal-700 flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-teal-100">
                            <FiClock className="text-teal-600" />
                            {Math.floor(paymentTimeLeft / 60)}:
                            {String(paymentTimeLeft % 60).padStart(2, '0')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100/70 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Status: Payment Pending</span>
                          </div>
                          <span className="text-[10.5px] text-teal-700 font-medium">10m valid window</span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-t border-b border-teal-100/80 text-xs">
                          <span className="text-slate-600">Booking Amount:</span>
                          <span className="font-extrabold text-teal-900 text-sm">
                            ₹
                            {(
                              (currentBookingState.amount || 50000) / 100
                            ).toFixed(2)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleRazorpayPayment}
                          disabled={paymentProcessing}
                          className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          <FiCreditCard />
                          {paymentProcessing
                            ? 'Processing Payment...'
                            : 'Pay Now via Razorpay'}
                        </button>
                      </div>
                    )}

                  {/* Payment Expired / Failed Card */}
                  {paymentExpired && !paymentSuccessful && (
                    <div className="bg-gradient-to-br from-rose-50 to-red-50/60 border border-rose-200/90 rounded-2xl p-4 shadow-sm space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                          <FiXCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Status: Payment Failed (Window Expired)</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                          Expired
                        </span>
                      </div>
                      <p className="text-[12px] text-rose-700 leading-normal">
                        The 10-minute payment window has expired. Your booking request was cancelled. Please request a new service to book again.
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentExpired(false);
                            setCurrentBookingState(null);
                            handleSendMessage('I would like to book a service again');
                          }}
                          className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <FiRefreshCw className="w-3.5 h-3.5" />
                          <span>Book Service Again</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* CHAT INPUT AREA */}
                <div className="p-3 bg-white/95 border-t border-slate-100/90 backdrop-blur-sm">
                  {/* Pill container */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="bg-white border border-slate-200/80 rounded-full pl-3 pr-1.5 py-1.5 flex items-center gap-2 shadow-xs focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all"
                  >
                    {/* Attachment button */}
                    <button
                      type="button"
                      title="Attach file"
                      className="text-slate-400 hover:text-teal-600 transition-colors cursor-pointer p-1"
                    >
                      <FiPaperclip className="w-4 h-4 rotate-45" />
                    </button>

                    {/* Text input */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 text-[13.5px] bg-transparent outline-none text-slate-700 placeholder-slate-400"
                    />

                    {/* Circular teal send button */}
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || aiThinking}
                      className="w-8 h-8 rounded-full bg-[#0D9488] hover:bg-[#0b8277] text-white flex items-center justify-center shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <FiSend className="w-3.5 h-3.5 ml-0.5 -mt-0.5" />
                    </button>
                  </form>

                  {/* Sub-footer powered text */}
                  <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-slate-400 font-medium mt-2 select-none">
                    <span>Powered by SwasthyaLink AI</span>
                    <HiSparkles className="text-teal-500 w-3 h-3" />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. COLLAPSED FLOATING LAUNCHER (Trigger) */}
      {!isOpen && (
        <div className="relative flex items-center gap-3 select-none">
          {/* Hand-drawn arrow pointing up-right to launcher */}
          <div className="absolute -bottom-2 -left-6 pointer-events-none select-none text-teal-500/80">
            <svg
              width="32"
              height="26"
              viewBox="0 0 40 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 24 C 14 30, 26 30, 32 14" />
              <path d="M25 12 L 32 14 L 33 22" />
            </svg>
          </div>

          {/* Left Speech Bubble Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setIsOpen(true)}
            className="cursor-pointer bg-white rounded-2xl shadow-lg border border-slate-100/90 py-2 px-3.5 flex flex-col relative group hover:shadow-xl transition-all"
          >
            <span className="font-bold text-slate-800 text-xs leading-tight group-hover:text-teal-700 transition-colors">
              Need help?
            </span>
            <span className="text-slate-500 text-[10.5px] font-medium leading-tight mt-0.5">
              Chat with our AI
            </span>

            {/* Speech bubble tail pointing right */}
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-r border-t border-slate-100/90 rotate-45 rounded-xs"></div>
          </motion.div>

          {/* Launcher Circle Button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="relative w-15 h-15 rounded-full bg-gradient-to-tr from-teal-500 via-teal-400 to-cyan-400 p-[2px] shadow-[0_8px_20px_-4px_rgba(13,148,136,0.35)] hover:shadow-[0_12px_25px_-3px_rgba(13,148,136,0.45)] cursor-pointer flex items-center justify-center transition-shadow"
          >
            {/* Inner background container */}
            <div className="w-full h-full rounded-full bg-gradient-to-b from-teal-50 to-white flex items-center justify-center overflow-hidden p-1">
              <img
                src={roboDoctorImg}
                alt="AI Doctor"
                className="w-full h-full object-contain filter drop-shadow-xs scale-110"
              />
            </div>

            {/* Notification Badge at Top Right (Red Beacon) */}
            <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white shadow-xs"></span>
            </div>
          </motion.button>
        </div>
      )}
    </div>
  );
}
