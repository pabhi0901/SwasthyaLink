import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { disconnectSocket } from '../services/socket'
import axios from 'axios'

const NurseNavbar = () => {
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

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5003/api/auth/logout', {}, {
        withCredentials: true
      })
      disconnectSocket()
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
          <Link to="/nurse" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-400 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-dark-900">SwashtyaLink</h1>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Nurse Portal</p>
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

            {/* Nurse Name and Role */}
            <div className="hidden md:block text-right">
              <h3 className="text-sm font-semibold text-dark-900">
                {user?.name || 'Nurse'}
              </h3>
              <p className="text-xs text-gray-600">Nursing Staff</p>
            </div>

            {/* Vertical Separator */}
            <div className="hidden md:block w-px h-8 sm:h-10 bg-gray-300"></div>

            {/* Profile Image - links to profile page */}
            <Link to="/profile" className="relative group" title="View Profile">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-primary-400 hover:border-primary-600 transition-colors"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-400 hover:bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm border-2 border-primary-400 transition-colors">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N'}
                </div>
              )}
              <div className="absolute -bottom-8 right-0 bg-dark-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                <span className="md:hidden">{user?.name || 'Nurse'}</span>
                <span className="hidden md:inline">{user?.name || 'Nurse'} · View Profile</span>
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

export default NurseNavbar
