import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const MedicalDepartments = () => {
  const navigate = useNavigate()

  const departments = [
    {
      id: 1,
      link: '/services',
      icon: (
        <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: 'Home Healthcare',
      description: 'Professional clinical care delivered in the privacy of your residence.'
    },
    {
      id: 2,
      icon: (
        <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'General Medicine',
      description: 'Comprehensive internal medicine focused on long-term wellness and prevention.'
    },
    {
      id: 3,
      icon: (
        <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'AI Support',
      description: 'Intelligent health assistance powered by advanced artificial intelligence technology.'
    },
    {
      id: 4,
      icon: (
        <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'One-to-One Video Consultations',
      description: 'Personalized virtual appointments with certified doctors from anywhere.',
      link: '/appointments'
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3" style={{ letterSpacing: '0.15em' }}>
              OUR EXPERTISE
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              World-Class Medical Departments
            </h2>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="text-teal-600 text-sm font-semibold uppercase tracking-wider hover:text-teal-700 transition-colors flex items-center gap-2"
            style={{ letterSpacing: '0.05em' }}
          >
            Explore All Appointments
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {departments.map((dept, index) => (
            <motion.div
              key={dept.id}
              onClick={() => dept.link && navigate(dept.link)}
              className="bg-white p-8 border-t-4 border-teal-500 shadow-sm hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
              animate={{
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 2.5,
                delay: index * 2.5,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut"
              }}
            >
              {/* Icon */}
              <div className="mb-6">
                {dept.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-serif text-gray-900 mb-3 group-hover:text-teal-600 transition-colors" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                {dept.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed" style={{ lineHeight: '1.7' }}>
                {dept.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MedicalDepartments
