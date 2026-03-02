import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { connectSocket } from '../../services/socket'
import axios from 'axios'

const Register = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const images = [
    'https://ik.imagekit.io/cdsjgzx6p/swasthyalink_extras/7a6f6392-f493-49db-8e94-022a2b9f9d68.jpg',
    'https://ik.imagekit.io/cdsjgzx6p/swasthyalink_extras/f06d57ec-1dc7-4571-9699-d67118251426.jpg'
  ]

  // Image carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 3000) // Change image every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('Please provide a valid 10-digit phone number')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'customer'
      }, {
        withCredentials: true
      })

      const data = response.data

      if (data.success) {
        // Connect to socket after successful registration
        connectSocket()
        
        // Navigate based on user type
        navigate('/')
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Left Side - Image and Content */}
      <div className="hidden lg:flex lg:w-1/2 p-8 flex-col justify-between" style={{ backgroundColor: '#eef3f2' }}>
        {/* Logo */}
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span className="text-xl font-bold text-primary-400">SwashtyaLink</span>
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="p-6">
            <div className="relative w-120 h-75 rounded-xl overflow-hidden mb-4">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Healthcare Professional ${index + 1}`}
                  className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
            <p className="text-primary-400 text-xs font-medium tracking-wider mb-3">
              WELCOME TO SWASHTYALINK
            </p>
            <h2 className="text-2xl font-bold text-dark-900 mb-1">
              Compassionate Care.
            </h2>
            <h2 className="text-2xl font-bold text-dark-900 mb-4">
              Modern Access.
            </h2>
            <p className="text-dark-600 text-sm leading-relaxed">
              Register to access trusted consultations, home services, and personalized medical support from the comfort of your home.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-dark-700 text-xs">
          © 2026 SwashtyaLink Healthcare
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6" style={{ height: '100vh', overflowY: 'auto' }}>
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span className="text-lg font-bold text-primary-400">SwashtyaLink</span>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-dark-900 mb-1">Create Your Account</h1>
            <p className="text-dark-600 text-xs">
              Join SwashtyaLink to manage appointments and access healthcare services.
            </p>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-dark-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. Jane Doe or John Doe"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="1234567890"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-dark-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-dark-700 mb-1">Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-400 hover:bg-primary-500 text-white font-semibold py-2 text-sm rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-dark-600 text-xs">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-500 transition-colors">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-dark-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your medical information is securely protected.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
