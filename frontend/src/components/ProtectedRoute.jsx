                                                                                                                                                                                                                                                                                        import React, { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:5003/api/auth/me', {
        withCredentials: true
      })

      const data = response.data

      if (data.success && data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Check if user has the allowed role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user's actual role
    const roleDashboards = {
      'admin': '/admin',
      'doctor': '/doctor',
      'nurse': '/nurse',
      'cashier': '/cashier',
      'customer': '/'
    }
    
    const redirectPath = roleDashboards[user.role] || '/'
    return <Navigate to={redirectPath} replace />
  }

  // Authenticated and has correct role
  return children
}

export default ProtectedRoute
