import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

const PatientRecords = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/admin')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Gateway</span>
        </button>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Patient Records</h1>
          <p className="text-gray-600 mb-6">
            Database oversight and digital health records access.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              Patient records management interface coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientRecords
