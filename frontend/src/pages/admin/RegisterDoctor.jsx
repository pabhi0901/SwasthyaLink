import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa'
import axios from 'axios'

const RegisterDoctor = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [doctorData, setDoctorData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    category: ''
  })

  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'general_physician', label: 'General Physician' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'cardiologist', label: 'Cardiologist' },
    { value: 'dermatologist', label: 'Dermatologist' },
    { value: 'gynecologist', label: 'Gynecologist' },
    { value: 'pediatrician', label: 'Pediatrician' },
    { value: 'psychiatrist', label: 'Psychiatrist' },
    { value: 'orthopedic', label: 'Orthopedic' },
    { value: 'neurologist', label: 'Neurologist' },
    { value: 'other', label: 'Other' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setDoctorData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const validateForm = () => {
    if (!doctorData.name.trim()) {
      setError('Full name is required')
      return false
    }
    if (!doctorData.email.trim() || !/\S+@\S+\.\S+/.test(doctorData.email)) {
      setError('Valid email address is required')
      return false
    }
    if (!doctorData.phone.trim() || !/^[0-9]{10}$/.test(doctorData.phone)) {
      setError('Valid 10-digit phone number is required')
      return false
    }
    if (doctorData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(doctorData.password)) {
      setError('Password must contain uppercase, lowercase, and number')
      return false
    }
    if (!doctorData.category) {
      setError('Please select a category')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post(
        'http://localhost:5003/api/auth/create-doctor',
        doctorData,
        {
          withCredentials: true
        }
      )
      
      if (response.data.success) {
        alert(`Doctor "${response.data.user.name}" registered successfully!`)
        navigate('/admin')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.response?.data?.message || 'Failed to register doctor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Left Side - Image and Content */}
      <div className="hidden lg:flex lg:w-1/2 p-8 flex-col justify-start gap-6" style={{ backgroundColor: '#eef3f2' }}>
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            <FaArrowLeft />
            <span>Back to Admin Panel</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="p-6">
            <div className="relative w-120 h-75 rounded-xl overflow-hidden mb-4">
              <img
                src="https://media.istockphoto.com/id/1530248188/photo/senior-doctor-using-digital-tablet-walking-with-nurses-in-hospital-corridor.jpg?s=612x612&w=0&k=20&c=-VPZoTpzKbzWVonYRIDdyQaSL4m-9_aVPebuBmHL8ZI="
                alt="Doctor with team"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-teal-600 text-xs font-medium tracking-wider mb-3">
              DOCTOR REGISTRATION PORTAL
            </p>
            <h2 className="text-2xl font-bold text-dark-900 mb-1">
              Expanding Medical Excellence.
            </h2>
            <h2 className="text-2xl font-bold text-dark-900 mb-4">
              One Doctor at a Time.
            </h2>
            <p className="text-dark-600 text-sm leading-relaxed">
              Register new medical practitioners to strengthen our clinical team and deliver exceptional patient care.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-dark-700 text-xs mt-auto">
          © 2026 SwashtyaLink Healthcare
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Form Content - Scrollable */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          <div className="max-w-md">
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
                Register New Doctor
              </h1>
              <p className="text-gray-600 text-sm" style={{ fontWeight: 400 }}>
                Onboard new medical practitioners to the clinical registry.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm" style={{ fontWeight: 500 }}>{error}</p>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={doctorData.name}
                  onChange={handleInputChange}
                  placeholder="Enter doctor's full name"
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
                  value={doctorData.email}
                  onChange={handleInputChange}
                  placeholder="doctor@hospital.com"
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
                  value={doctorData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  style={{ fontSize: '15px', fontWeight: 400 }}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Specialization Category
                </label>
                <select
                  name="category"
                  value={doctorData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  style={{ fontSize: '15px', fontWeight: 400 }}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Temporary Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={doctorData.password}
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
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '15px', fontWeight: 600 }}
              >
                {loading ? 'Registering...' : 'Register Doctor'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="w-full py-1.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Cancel
              </button>
            </form>

            {/* Security Note */}
            <div className="mt-3 pt-3 border-t border-gray-200">
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


export default RegisterDoctor
