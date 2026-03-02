import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Button from './Button'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchType, setSearchType] = useState('services')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        withCredentials: true
      })
      if (response.data.success) {
        setIsLoggedIn(true)
        setUser(response.data.user)
      }
    } catch (err) {
      setIsLoggedIn(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, {
        withCredentials: true
      })
      setIsLoggedIn(false)
      setUser(null)
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      if (searchType === 'services') {
        navigate(`/services?search=${encodeURIComponent(searchQuery)}`)
      } else {
        navigate(`/appointments?search=${encodeURIComponent(searchQuery)}`)
      }
      setSearchQuery('')
    }
  }

  const getDashboardLink = (role) => {
    if (role === 'doctor') return { name: 'Doctor Dashboard', path: '/doctor' }
    if (role === 'nurse') return { name: 'Nurse Dashboard', path: '/nurse' }
    if (role === 'admin') return { name: 'Admin Dashboard', path: '/admin' }
    return null
  }

  const isStaff = user?.role === 'doctor' || user?.role === 'nurse' || user?.role === 'admin'
  const dashboardLink = getDashboardLink(user?.role)

  const navLinks = isStaff
    ? (dashboardLink ? [dashboardLink] : [])
    : [
        { name: 'Services', path: '/services' },
        { name: 'Appointments', path: '/appointments' },
      ]

  const accountLinks = [
    { name: 'Profile', path: '/profile' },
    { name: 'My Bookings', path: '/my-bookings' },
  ]

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-400 rounded-lg flex items-center justify-center group-hover:bg-primary-500 transition-colors">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span className="text-lg md:text-xl font-bold text-primary-400">SwashtyaLink</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-dark-600 hover:text-primary font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {/* Account Dropdown - Only show when logged in */}
            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsAccountDropdownOpen(false), 200)}
                  className="text-dark-600 hover:text-primary font-medium transition-colors flex items-center gap-1"
                >
                  Account
                  <svg className={`w-4 h-4 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isAccountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {accountLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className="block px-4 py-2 text-dark-600 hover:bg-gray-100 hover:text-primary transition-colors"
                        onClick={() => setIsAccountDropdownOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search & Login/User */}
          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                {/* Search Type Dropdown */}
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md px-2 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-all"
                >
                  <option value="services">Services</option>
                  <option value="appointments">Appointments</option>
                </select>
                
                {/* Divider */}
                <div className="h-6 w-px bg-gray-300"></div>
                
                {/* Search Input */}
                <div className="relative flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${searchType}...`}
                    className="w-40 lg:w-48 bg-transparent border-none outline-none text-sm placeholder-gray-400"
                  />
                </div>
              </div>
            </form>
            
            {/* Show Login button or Profile Image */}
            {!loading && (
              isLoggedIn ? (
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  title="Go to Profile"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'Profile'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary-400 hover:border-primary-600 transition-colors"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-2 border-primary-400 hover:border-primary-600 transition-colors">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </button>
              ) : (
                <Button variant="primary" size="md" onClick={() => navigate('/login')}>
                  Login
                </Button>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-dark-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-dark-600 hover:text-primary font-medium transition-colors px-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Account Section - Only show when logged in */}
              {isLoggedIn && (
                <div className="px-2">
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Account</p>
                  {accountLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="block text-dark-600 hover:text-primary font-medium transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left text-red-600 hover:text-red-700 font-medium transition-colors py-2"
                  >
                    Logout
                  </button>
                </div>
              )}
              
              <form onSubmit={handleSearch} className="w-full px-2 pb-2">
                {/* Search Type Dropdown */}
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full mb-3 px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
                >
                  <option value="services">Search in Services</option>
                  <option value="appointments">Search in Appointments</option>
                </select>
                
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${searchType}...`}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent focus:border-primary focus:bg-white rounded-lg outline-none transition-all text-sm"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
              
              {/* Show Login button only if not logged in */}
              {!loading && !isLoggedIn && (
                <div className="px-2">
                  <Button variant="primary" size="md" className="w-full justify-center" onClick={() => {
                    navigate('/login')
                    setIsMenuOpen(false)
                  }}>
                    Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
