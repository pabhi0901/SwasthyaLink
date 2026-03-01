import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MyServices from './MyServices'
import MyAppointments from './MyAppointments'

const MyBookings = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('services') // 'services' or 'appointments'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors group"
        >
          <svg 
            className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-gray-600 mt-2">Track your services and appointments</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('services')}
              className={`pb-4 px-2 font-semibold transition-all relative ${
                activeTab === 'services'
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Services
              {activeTab === 'services' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`pb-4 px-2 font-semibold transition-all relative ${
                activeTab === 'appointments'
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Appointments
              {activeTab === 'appointments' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'services' ? <MyServices /> : <MyAppointments />}
      </div>
      <Footer />
    </div>
  )
}

export default MyBookings