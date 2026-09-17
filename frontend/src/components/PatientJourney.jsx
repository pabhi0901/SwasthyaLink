import React from 'react'
import { motion } from 'framer-motion'

const PatientJourney = () => {
  const steps = [
    {
      id: 1,
      number: '01',
      stepNumber: 'STEP 01',
      title: 'Virtual Consultation',
      description: 'Connect with certified doctors through secure video calls from anywhere.',
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 2,
      number: '02',
      stepNumber: 'STEP 02',
      title: 'Analysis & Prescription',
      description: 'Receive detailed medical analysis and instant digital prescriptions online.',
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 3,
      number: '03',
      stepNumber: 'STEP 03',
      title: 'Home Care Delivery',
      description: 'Get medicines and personalized care services delivered to your home.',
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    }
  ]

  // Subtle gentle wave animation across circles
  const circleVariants = {
    animate: (i) => ({
      y: [0, -6, 0],
      boxShadow: [
        '0 8px 24px rgba(20, 184, 166, 0.10)',
        '0 14px 32px rgba(20, 184, 166, 0.22)',
        '0 8px 24px rgba(20, 184, 166, 0.10)',
      ],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        repeatDelay: 4.2,
        delay: i * 2.0,
        ease: 'easeInOut',
      },
    }),
  }

  return (
    <section className="relative py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f6fbf9]/60 via-white to-[#f6fbf9]/40 overflow-hidden">
      {/* Top-Left Organic Curved Backdrop */}
      <div className="absolute -top-12 -left-12 w-[420px] h-[340px] bg-gradient-to-br from-[#dcf2eb]/80 via-[#ebf7f3]/50 to-transparent rounded-br-[16rem] pointer-events-none -z-10" />

      {/* Two Delicate Mint Leaves Matching Reference 2 Exactly */}
      <div className="hidden md:block absolute left-10 lg:left-16 top-24 lg:top-28 select-none pointer-events-none">
        <svg
          viewBox="0 0 80 80"
          className="w-14 h-14 text-[#7ec6b8] fill-current drop-shadow-xs"
        >
          {/* Primary Leaf pointing up-right */}
          <path d="M30 52 C32 30 48 14 65 12 C65 28 50 46 30 52 Z" />
          {/* Secondary Leaf angled to the right */}
          <path d="M30 52 C22 42 18 28 22 18 C33 20 38 34 30 52 Z" />
        </svg>
      </div>

      {/* Bottom-Right Soft Organic Backdrop */}
      <div className="absolute -bottom-16 -right-16 w-[380px] h-[300px] bg-gradient-to-tl from-[#dcf2eb]/60 via-[#ebf7f3]/40 to-transparent rounded-tl-[14rem] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center relative mb-20 sm:mb-24">
          {/* Authentic Handwritten Script Note at Top Right */}
          <div
            className="hidden md:block absolute -top-5 right-6 lg:right-16 text-[#72beaf] select-none pointer-events-none transform rotate-[8deg] text-left"
            style={{ fontFamily: "'Covered By Your Grace', 'Nothing You Could Do', 'Shadows Into Light', cursive" }}
          >
            <p className="text-3xl lg:text-[2.35rem] leading-[0.95] tracking-wide">Better</p>
            <p className="text-3xl lg:text-[2.35rem] leading-[0.95] tracking-wide ml-3 mt-1">Care</p>
            <p className="text-3xl lg:text-[2.35rem] leading-[0.95] tracking-wide ml-6 mt-1">Brighter</p>
            <p className="text-3xl lg:text-[2.35rem] leading-[0.95] tracking-wide ml-9 mt-1 flex items-center gap-1.5">
              Days <span className="text-2xl lg:text-3xl transform translate-y-0.5 font-light">♡</span>
            </p>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center justify-center gap-2.5 mb-3">
            <span
              className="text-[11.5px] font-bold text-amber-800/90 tracking-[0.16em] uppercase"
            >
              PATIENT PATH
            </span>
            <span className="inline-block w-12 h-[1.5px] bg-amber-600/40" />
          </div>

          {/* Title */}
          <h2
            className="text-3xl sm:text-4xl lg:text-[2.85rem] font-serif text-slate-900 tracking-tight leading-tight"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            The Journey to Recovery
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-[13.5px] text-slate-500 leading-relaxed max-w-xl mx-auto mt-2.5 font-normal">
            Simple steps, seamless care — because your health journey should be easy, safe, and supportive.
          </p>
        </div>

        {/* Timeline Path Layout */}
        <div className="relative">
          {/* Connecting Line - Desktop Only */}
          <div className="hidden md:block absolute top-14 sm:top-16 left-[16.66%] right-[16.66%] h-[2px] bg-teal-100/90 z-0">
            {/* Checkpoint Dot between Step 1 and Step 2 */}
            <div className="absolute top-1/2 left-[40%] -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-teal-200 border-2 border-white shadow-xs" />
            
            {/* Checkpoint Dot between Step 2 and Step 3 */}
            <div className="absolute top-1/2 left-[60%] -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-teal-200 border-2 border-white shadow-xs" />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-8 lg:gap-12 relative z-10">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center text-center">
                {/* Milestone Circle with Floating Glow and Number Badge */}
                <motion.div
                  custom={index}
                  variants={circleVariants}
                  animate="animate"
                  whileHover={{ scale: 1.06, transition: { duration: 0.2 } }}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white border-2 border-teal-100 flex items-center justify-center mb-6 relative z-10 shadow-[0_8px_30px_rgba(20,184,166,0.12)] cursor-pointer"
                >
                  {/* Subtle inner mint gradient halo */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-b from-teal-50/50 to-transparent pointer-events-none -z-0" />

                  {/* Icon */}
                  <div className="relative z-10">
                    {step.icon}
                  </div>

                  {/* Number Badge at Top-Right (2 o'clock position) */}
                  <div className="absolute top-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 font-semibold text-xs flex items-center justify-center shadow-xs">
                    {step.number}
                  </div>
                </motion.div>

                {/* Step Number Tag */}
                <p
                  className="text-[11px] font-bold text-amber-800 tracking-[0.14em] uppercase mb-1.5"
                >
                  {step.stepNumber}
                </p>

                {/* Title */}
                <h3
                  className="text-xl sm:text-2xl font-serif text-slate-900 mb-2 font-medium"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed max-w-[270px] font-normal">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default PatientJourney
