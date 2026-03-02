import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const HomeAppointments = () => {
  const navigate = useNavigate()
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      console.log('HomeAppointments: Fetching consultations...')
      // Empty search returns all active consultations
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/doctor/search-consultations?search=`,
        { withCredentials: true }
      )

    //   console.log('HomeAppointments: Response:', response.data)

      if (response.data.success) {
        // Take only first 3 consultations
        const allConsultations = response.data.consultations || []
        console.log('HomeAppointments: Total consultations:', allConsultations.length)
        setConsultations(allConsultations.slice(0, 3))
      }
    } catch (error) {
      console.error('HomeAppointments: Error fetching consultations:', error)
      console.error('HomeAppointments: Error response:', error.response?.data)
      // Don't hide the section on error, just show empty state
      setConsultations([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '45 min'
    return `${minutes} min`
  }

  const formatCategoryName = (category) => {
    if (!category) return 'GENERAL CONSULTATION'
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').toUpperCase()
  }

  if (loading) {
    return null
  }

  // Show message if no consultations available
  if (consultations.length === 0) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-3" style={{ letterSpacing: '0.15em' }}>
            Online Doctor Consultation
          </p>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
           Available Virtual Appointments
          </h2>
          <p className="text-gray-600">No consultations available at the moment. Check back later!</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-3" style={{ letterSpacing: '0.15em' }}>
              Online Doctor Consultation
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
             Available Virtual Appointments
            </h2>
          </div>
          
          <button
            onClick={() => navigate('/appointments')}
            className="text-primary-600 text-sm font-semibold uppercase tracking-wider hover:text-primary-700 transition-colors flex items-center gap-2"
            style={{ letterSpacing: '0.05em' }}
          >
            View all consultations
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Consultations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultations.map((consultation) => {
            const doctor = consultation.doctorId
            
            return (
              <div
                key={consultation._id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200"
                onClick={() => navigate(`/consultation/${consultation._id}`)}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                  {consultation.image ? (
                    <img
                      src={consultation.image}
                      alt={consultation.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold bg-white text-primary-600 shadow-md">
                    {formatPrice(consultation.price)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-xs text-primary-600 font-semibold uppercase tracking-wider mb-2">
                    {formatCategoryName(consultation.category)}
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {consultation.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                    Dr. {doctor?.name || 'Specialist'}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(consultation.date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Video Consultation • {formatDuration(consultation.duration)}
                    </div>
                  </div>

                  <button
                    className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/consultation/${consultation._id}`)
                    }}
                  >
                    Book Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HomeAppointments
