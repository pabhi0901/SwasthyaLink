import React from 'react'

const PatientJourney = () => {
  const steps = [
    {
      id: 1,
      stepNumber: 'STEP 01',
      title: 'Virtual Consultation',
      description: 'Connect with certified doctors through secure video calls from anywhere.',
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 2,
      stepNumber: 'STEP 02',
      title: 'Analysis & Prescription',
      description: 'Receive detailed medical analysis and instant digital prescriptions online.',
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 3,
      stepNumber: 'STEP 03',
      title: 'Home Care Delivery',
      description: 'Get medicines and personalized care services delivered to your home.',
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3" style={{ letterSpacing: '0.15em' }}>
            PATIENT PATH
          </p>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            The Journey to Recovery
          </h2>
        </div>

        {/* Steps with connecting lines */}
        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gray-300" style={{ left: '16.66%', right: '16.66%' }}></div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center text-center relative">
                {/* Icon Circle */}
                <div className="w-28 h-28 bg-white border-4 border-gray-200 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-sm hover:border-teal-500 transition-colors duration-300">
                  {step.icon}
                </div>

                {/* Step Number */}
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3" style={{ letterSpacing: '0.15em' }}>
                  {step.stepNumber}
                </p>

                {/* Title */}
                <h3 className="text-2xl font-serif text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed max-w-xs" style={{ lineHeight: '1.7' }}>
                  {step.description}
                </p>

                {/* Mobile connecting line */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden w-0.5 h-8 bg-gray-300 mt-6"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PatientJourney
