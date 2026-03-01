import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const DoctorNavbar = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:5003/api/auth/me', {
        withCredentials: true
      })
      if (response.status === 200) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  // Helper function to format category text
  const formatCategory = (category) => {
    if (!category) return ''
    return category
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5003/api/auth/logout', {}, {
        withCredentials: true
      })
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Side - Logo and Brand */}
          <Link to="/doctor" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-dark-900">SwashtyaLink</h1>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Doctor Portal</p>
            </div>
          </Link>

          {/* Right Side - Info and Logout */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {/* Status Badge */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${user?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wide text-gray-600">
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Doctor Name and Role */}
            <div className="hidden md:block text-right">
              <h3 className="text-sm font-semibold text-dark-900">
                {user?.name || 'Doctor'}
              </h3>
              {user?.category && (
                <p className="text-xs text-blue-600 font-medium">{formatCategory(user.category)}</p>
              )}
            </div>

            {/* Vertical Separator */}
            <div className="hidden md:block w-px h-8 sm:h-10 bg-gray-300"></div>

            {/* Profile Image - links to profile page */}
            <Link to="/profile" className="relative group" title="View Profile">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-blue-500 hover:border-blue-700 transition-colors"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm border-2 border-blue-500 transition-colors">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'D'}
                </div>
              )}
              <div className="absolute -bottom-8 right-0 bg-dark-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                <span>{user?.name || 'Doctor'} · View Profile</span>
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default DoctorNavbar
