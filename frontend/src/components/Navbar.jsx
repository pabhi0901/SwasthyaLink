import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { disconnectSocket } from '../services/socket'
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

  const defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token)
        }
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
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      )
      localStorage.removeItem('authToken')
      disconnectSocket()
      setIsLoggedIn(false)
      setUser(null)
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
      localStorage.removeItem('authToken')
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

  const handleOpenChatbot = () => {
    window.dispatchEvent(new Event('open-swasthyalink-chatbot'))
  }

  const navLinks = isStaff
    ? dashboardLink
      ? [dashboardLink, { name: 'AI Assistant', isAi: true }]
      : [{ name: 'AI Assistant', isAi: true }]
    : [
        { name: 'Services', path: '/services' },
        { name: 'Appointments', path: '/appointments' },
        { name: 'AI Assistant', isAi: true },
      ]

  const accountLinks = [
    { name: 'Profile', path: '/profile' },
    { name: 'My Bookings', path: '/my-bookings' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 bg-transparent">
      <nav className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100/90 px-4 sm:px-6 py-2 transition-all">
        <div className="flex justify-between items-center h-12 sm:h-14">
          
          {/* Logo with Medical Box & Tagline */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition-colors">
              <svg
                className="w-5 h-5 sm:w-5.5 sm:h-5.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="7" width="18" height="14" rx="2" ry="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight">
                SwasthyaLink
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight -mt-0.5">
                Your Health, Our Support
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.isAi ? (
                <button
                  key={link.name}
                  type="button"
                  onClick={handleOpenChatbot}
                  className="font-semibold transition-all flex items-center gap-1.5 text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-3.5 py-1.5 rounded-full border border-teal-200/80 shadow-xs cursor-pointer text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                  <span>{link.name}</span>
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-xs sm:text-sm font-semibold transition-colors text-slate-600 hover:text-teal-600"
                >
                  {link.name}
                </Link>
              )
            )}

            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                onBlur={() => setTimeout(() => setIsAccountDropdownOpen(false), 200)}
                className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Account</span>
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isAccountDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isAccountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                  {isLoggedIn ? (
                    <>
                      {accountLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                          onClick={() => setIsAccountDropdownOpen(false)}
                        >
                          {link.name}
                        </Link>
                      ))}
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        onClick={() => setIsAccountDropdownOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        onClick={() => setIsAccountDropdownOpen(false)}
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar & User Avatar */}
          <div className="hidden md:flex items-center gap-3.5">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-100 rounded-xl px-2.5 py-1.5 border border-slate-200/50 transition-colors">
                {/* Search Type Dropdown */}
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 border-none outline-none cursor-pointer pr-1"
                >
                  <option value="services">Services</option>
                  <option value="appointments">Appointments</option>
                </select>

                {/* Divider */}
                <div className="h-4 w-px bg-slate-300"></div>

                {/* Search Input */}
                <div className="relative flex items-center">
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search services...`}
                    className="w-32 lg:w-44 bg-transparent border-none outline-none text-xs text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>
            </form>

            {/* Profile Avatar / Login */}
            {!loading && (
              <button
                onClick={() => navigate(isLoggedIn ? '/profile' : '/login')}
                className="flex items-center hover:opacity-90 transition-opacity cursor-pointer"
                title={isLoggedIn ? (user?.name || 'Profile') : 'Login'}
              >
                <img
                  src={user?.image || defaultAvatar}
                  alt={user?.name || 'Profile'}
                  className="w-8.5 h-8.5 rounded-full object-cover ring-2 ring-teal-500/70 shadow-xs"
                />
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 mt-2 space-y-3">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) =>
                link.isAi ? (
                  <button
                    key={link.name}
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleOpenChatbot()
                    }}
                    className="font-semibold px-3 py-2 flex items-center gap-2 text-teal-700 bg-teal-50 rounded-xl text-xs text-left w-full cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    {link.name}
                  </button>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="font-medium text-xs text-slate-700 hover:text-teal-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )
              )}

              {isLoggedIn ? (
                <>
                  <div className="border-t border-slate-100 pt-2 px-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Account
                    </p>
                    {accountLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className="block py-1.5 text-xs text-slate-700 hover:text-teal-600 font-medium"
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
                      className="block w-full text-left py-1.5 text-xs text-rose-600 font-medium cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-3 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={() => {
                      navigate('/login')
                      setIsMenuOpen(false)
                    }}
                  >
                    Login
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${searchType}...`}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-xl text-xs text-slate-700 outline-none focus:ring-1 focus:ring-teal-400"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </form>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
