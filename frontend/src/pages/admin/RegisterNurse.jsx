import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FaArrowLeft, FaEye, FaEyeSlash, FaSearch, FaCheck } from 'react-icons/fa'
import axios from 'axios'

const RegisterNurse = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Step 1: Basic Information
  const [nurseData, setNurseData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  // Step 2: Shift Assignment
  const [shiftData, setShiftData] = useState({
    startHour: '',
    startMinute: '',
    endHour: '',
    endMinute: '',
    weeklyOffDays: []
  })

  // Step 3: Service Assignment
  const [services, setServices] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [servicesLoading, setServicesLoading] = useState(false)

  const [nurseId, setNurseId] = useState(null)

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNurseData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleShiftChange = (e) => {
    const { name, value } = e.target
    setShiftData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleDayToggle = (dayValue) => {
    setShiftData(prev => ({
      ...prev,
      weeklyOffDays: prev.weeklyOffDays.includes(dayValue)
        ? prev.weeklyOffDays.filter(d => d !== dayValue)
        : [...prev.weeklyOffDays, dayValue]
    }))
  }

  const validateBasicInfo = () => {
    if (!nurseData.name.trim()) {
      setError('Full name is required')
      return false
    }
    if (!nurseData.email.trim() || !/\S+@\S+\.\S+/.test(nurseData.email)) {
      setError('Valid email address is required')
      return false
    }
    if (!nurseData.phone.trim() || !/^[0-9]{10}$/.test(nurseData.phone)) {
      setError('Valid 10-digit phone number is required')
      return false
    }
    if (nurseData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(nurseData.password)) {
      setError('Password must contain uppercase, lowercase, and number')
      return false
    }
    return true
  }

  const validateShiftData = () => {
    if (!shiftData.startHour || !shiftData.startMinute || !shiftData.endHour || !shiftData.endMinute) {
      setError('Please fill in all shift time fields')
      return false
    }
    
    const startMinutes = parseInt(shiftData.startHour) * 60 + parseInt(shiftData.startMinute)
    const endMinutes = parseInt(shiftData.endHour) * 60 + parseInt(shiftData.endMinute)
    
    if (endMinutes <= startMinutes) {
      setError('End time must be after start time')
      return false
    }
    
    return true
  }

  const handleRegisterNurse = async (e) => {
    e.preventDefault()
    
    if (!validateBasicInfo()) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post(
        'http://localhost:5003/api/auth/create-nurse',
        nurseData,
        {
          withCredentials: true
        }
      )
      
      if (response.data.success) {
        // Store the nurse ID from response for shift assignment
        setNurseId(response.data.user.id)
        setStep(2)
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.response?.data?.message || 'Failed to register nurse')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignShift = async (e) => {
    e.preventDefault()
    
    if (!validateShiftData()) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post(
        'http://localhost:5003/api/admin/nurse-time-shift',
        {
          nurseId,
          startHour: parseInt(shiftData.startHour),
          startMinute: parseInt(shiftData.startMinute),
          endHour: parseInt(shiftData.endHour),
          endMinute: parseInt(shiftData.endMinute),
          weeklyOffDays: shiftData.weeklyOffDays
        },
        {
          withCredentials: true
        }
      )
      
      if (response.data.mess === 'Time shift assigned successfully') {
        // Move to service assignment
        setStep(3)
        fetchServices()
      }
    } catch (err) {
      console.error('Shift assignment error:', err)
      setError(err.response?.data?.mess || 'Failed to assign shift')
    } finally {
      setLoading(false)
    }
  }

  // Fetch services with pagination
  const fetchServices = async (page = 1, search = '') => {
    setServicesLoading(true)
    setError('')
    
    try {
      const endpoint = search 
        ? `http://localhost:5003/api/services/search?search=${encodeURIComponent(search)}&page=${page}&limit=10`
        : `http://localhost:5003/api/services/?page=${page}&limit=10`
      
      const response = await axios.get(endpoint, {
        withCredentials: true
      })
      
      if (response.data.success) {
        setServices(response.data.services)
        setCurrentPage(response.data.pagination.currentPage)
        setTotalPages(response.data.pagination.totalPages)
      }
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Failed to fetch services')
    } finally {
      setServicesLoading(false)
    }
  }

  const handleSearchServices = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchServices(1, searchQuery)
  }

  const toggleServiceSelection = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleAssignServices = async (e) => {
    e.preventDefault()
    
    if (selectedServices.length === 0) {
      setError('Please select at least one service')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Assign each selected service to the nurse
      const assignPromises = selectedServices.map(serviceId =>
        axios.post(
          'http://localhost:5003/api/admin/assign-service',
          {
            nurseId,
            serviceId,
            commissionPercentage: 20
          },
          {
            withCredentials: true
          }
        )
      )
      
      await Promise.all(assignPromises)
      
      alert('Nurse onboarded successfully with assigned services!')
      navigate('/admin')
    } catch (err) {
      console.error('Service assignment error:', err)
      setError(err.response?.data?.message || 'Failed to assign services')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Left Side - Image and Content */}
      <div className="hidden lg:flex lg:w-1/2 p-8 flex-col justify-between" style={{ backgroundColor: '#eef3f2' }}>
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            <FaArrowLeft />
            <span>{step === 1 ? 'Back to Gateway' : 'Back to Admin Panel'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="p-6">
            <div className="relative w-120 h-75 rounded-xl overflow-hidden mb-4">
              <img
                src="https://media.istockphoto.com/id/1270402508/photo/nurse-in-uniform-posing-with-file-in-hand-facing-camera.jpg?s=612x612&w=0&k=20&c=eBvbMrfIJ_Ev64hsQ2_bO8OA1aRwfb_fe9pDiXV0m3g="
                alt="Professional Nurse"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-teal-600 text-xs font-medium tracking-wider mb-3">
              NURSE REGISTRATION PORTAL
            </p>
            <h2 className="text-2xl font-bold text-dark-900 mb-1">
              Building Our Care Team.
            </h2>
            <h2 className="text-2xl font-bold text-dark-900 mb-4">
              One Nurse at a Time.
            </h2>
            <p className="text-dark-600 text-sm leading-relaxed">
              Register new nursing professionals to expand our healthcare delivery capabilities and ensure quality patient care.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-dark-700 text-xs">
          © 2026 SwashtyaLink Healthcare
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Form Content - Scrollable */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          <div className="max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-teal-600">SwashtyaLink</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-6">
              <p className="text-teal-600 text-xs font-semibold uppercase tracking-wider mb-2" style={{ letterSpacing: '0.1em' }}>
                Registration
              </p>
              <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontWeight: 700, lineHeight: 1.2 }}>
                Register New Nurse
              </h1>
              <p className="text-gray-600 text-sm" style={{ fontWeight: 400 }}>
                {step === 1 
                  ? 'Add a new nursing staff member to the institutional system.' 
                  : step === 2
                  ? 'Assign work schedule and weekly off days.'
                  : 'Assign services that this nurse will provide.'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm" style={{ fontWeight: 500 }}>{error}</p>
              </div>
            )}

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <form onSubmit={handleRegisterNurse} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={nurseData.name}
                  onChange={handleInputChange}
                  placeholder="Enter nurse's full name"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  style={{ fontSize: '15px', fontWeight: 400 }}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={nurseData.email}
                  onChange={handleInputChange}
                  placeholder="nurse@hospital.com"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  style={{ fontSize: '15px', fontWeight: 400 }}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={nurseData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  style={{ fontSize: '15px', fontWeight: 400 }}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Temporary Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={nurseData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all pr-12"
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '15px', fontWeight: 600 }}
              >
                {loading ? 'Registering...' : 'Register Nurse'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="w-full py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Cancel
              </button>
            </form>
          )}

          {/* Step 2: Shift Assignment */}
          {step === 2 && (
            <form onSubmit={handleAssignShift} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    Start Time - Hour
                  </label>
                  <select
                    name="startHour"
                    value={shiftData.startHour}
                    onChange={handleShiftChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  >
                    <option value="">Hour</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    Start Time - Minute
                  </label>
                  <select
                    name="startMinute"
                    value={shiftData.startMinute}
                    onChange={handleShiftChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  >
                    <option value="">Minute</option>
                    {[0, 15, 30, 45].map(min => (
                      <option key={min} value={min}>{min.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    End Time - Hour
                  </label>
                  <select
                    name="endHour"
                    value={shiftData.endHour}
                    onChange={handleShiftChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  >
                    <option value="">Hour</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    End Time - Minute
                  </label>
                  <select
                    name="endMinute"
                    value={shiftData.endMinute}
                    onChange={handleShiftChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  >
                    <option value="">Minute</option>
                    {[0, 15, 30, 45].map(min => (
                      <option key={min} value={min}>{min.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Weekly Off Days (Select multiple)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all ${
                        shiftData.weeklyOffDays.includes(day.value)
                          ? 'bg-teal-50 border-teal-500 text-teal-700'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-teal-300'
                      }`}
                      style={{ fontSize: '13px', fontWeight: 500 }}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '15px', fontWeight: 600 }}
              >
                {loading ? 'Assigning Shift...' : 'Continue to Service Assignment'}
              </button>
            </form>
          )}

          {/* Step 3: Service Assignment */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Search Bar */}
              <form onSubmit={handleSearchServices} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services by name..."
                    className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  Search
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      fetchServices(1, '')
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    Clear
                  </button>
                )}
              </form>

              {/* Services List */}
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {servicesLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading services...</p>
                  </div>
                ) : services.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-600 text-sm">No services found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {services.map(service => (
                      <div
                        key={service._id}
                        onClick={() => toggleServiceSelection(service._id)}
                        className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedServices.includes(service._id) ? 'bg-teal-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {service.name}
                            </h4>
                            {service.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                {service.description}
                              </p>
                            )}
                          </div>
                          {selectedServices.includes(service._id) && (
                            <FaCheck className="text-teal-600 ml-3 shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => fetchServices(currentPage - 1, searchQuery)}
                    disabled={currentPage === 1 || servicesLoading}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchServices(currentPage + 1, searchQuery)}
                    disabled={currentPage === totalPages || servicesLoading}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Selected Count */}
              {selectedServices.length > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-teal-600">{selectedServices.length}</span> service(s) selected
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleAssignServices}
                  disabled={loading || selectedServices.length === 0}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: '15px', fontWeight: 600 }}
                >
                  {loading ? 'Assigning Services...' : 'Complete Onboarding'}
                </button>
                <button
                  onClick={() => {
                    // Skip service assignment and complete onboarding
                    alert('Nurse onboarded successfully!')
                    navigate('/admin')
                  }}
                  disabled={loading}
                  className="w-full py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Skip Service Assignment
                </button>
              </div>
            </div>
          )}

          {/* Security Note */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-center text-gray-500 flex items-center justify-center gap-2" style={{ fontSize: '12px' }}>
              <span>🔒</span>
              <span>All staff credentials are securely encrypted within the system.</span>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterNurse
