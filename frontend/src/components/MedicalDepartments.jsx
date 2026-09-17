import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const MedicalDepartments = () => {
  const navigate = useNavigate()

  const handleCardClick = (dept) => {
    if (dept.isAi) {
      window.dispatchEvent(new Event('open-swasthyalink-chatbot'))
    } else if (dept.link) {
      navigate(dept.link)
    }
  }

  // 4 Core Medical Departments with integrated visual assets
  const departments = [
    {
      id: 1,
      number: '01',
      title: 'Home Healthcare',
      description: 'Professional clinical care delivered in the privacy of your residence.',
      tag: 'Home Visit',
      image: 'https://ik.imagekit.io/g6obyrspb/homehealthcare.png',
      link: '/services',
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 2,
      number: '02',
      title: 'General Medicine',
      description: 'Comprehensive internal medicine focused on long-term wellness and prevention.',
      tag: 'In-Clinic & Consult',
      image: 'https://ik.imagekit.io/g6obyrspb/general_medicine.png',
      link: '/services',
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 3,
      number: '03',
      title: 'AI Support',
      description: 'Intelligent health assistance powered by advanced artificial intelligence technology.',
      tag: '24/7 Smart Health',
      image: 'https://ik.imagekit.io/g6obyrspb/ai_support.png',
      link: '/services',
      isAi: true,
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 4,
      number: '04',
      title: 'One-to-One Video Consultations',
      description: 'Personalized virtual appointments with certified doctors from anywhere.',
      tag: 'Online HD Video',
      image: 'https://ik.imagekit.io/g6obyrspb/video_consultancies.png',
      link: '/appointments',
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  // Sequential one-by-one subtle animation variants (8s loop cycle, 2s stagger)
  const cardAnimationVariants = {
    animate: (i) => ({
      y: [0, -6, 0],
      boxShadow: [
        '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
        '0 14px 28px -4px rgba(13, 148, 136, 0.18), 0 4px 10px -2px rgba(13, 148, 136, 0.08)',
        '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
      ],
      borderColor: [
        'rgba(226, 232, 240, 0.85)',
        'rgba(20, 184, 166, 0.65)',
        'rgba(226, 232, 240, 0.85)',
      ],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        repeatDelay: 6.2,
        delay: i * 2.0,
        ease: 'easeInOut',
      },
    }),
  }

  const imageAnimationVariants = {
    animate: (i) => ({
      scale: [1, 1.08, 1],
      rotate: [0, 2, 0],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        repeatDelay: 6.2,
        delay: i * 2.0,
        ease: 'easeInOut',
      },
    }),
  }

  const topBarVariants = {
    animate: (i) => ({
      opacity: [0.75, 1, 0.75],
      height: ['4px', '6px', '4px'],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        repeatDelay: 6.2,
        delay: i * 2.0,
        ease: 'easeInOut',
      },
    }),
  }

  const arrowVariants = {
    animate: (i) => ({
      backgroundColor: ['#f8fafc', '#0d9488', '#f8fafc'],
      color: ['#475569', '#ffffff', '#475569'],
      borderColor: ['#e2e8f0', '#0d9488', '#e2e8f0'],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        repeatDelay: 6.2,
        delay: i * 2.0,
        ease: 'easeInOut',
      },
    }),
  }

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#f8faf9] to-white overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal-50/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-14 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[11px] font-bold text-amber-800/90 tracking-widest uppercase"
                style={{ letterSpacing: '0.15em' }}
              >
                OUR EXPERTISE
              </span>
              <span className="w-6 h-px bg-amber-600/30" />
            </div>
            
            <h2
              className="text-3xl sm:text-4xl lg:text-[2.75rem] font-serif text-slate-900 tracking-tight leading-tight"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              World-Class Medical Departments
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mt-2 font-normal">
              Specialized clinical excellence, cutting-edge technology, and patient-first compassionate care delivered seamlessly.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/appointments')}
            className="text-teal-600 hover:text-teal-700 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 group cursor-pointer shrink-0 pb-1"
            style={{ letterSpacing: '0.08em' }}
          >
            <span>Explore All Appointments</span>
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 4 Cards Grid - Square Shape */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {departments.map((dept, index) => (
            <motion.div
              key={dept.id}
              onClick={() => handleCardClick(dept)}
              custom={index}
              variants={cardAnimationVariants}
              animate="animate"
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.22 } }}
              className="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/85 shadow-sm hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer aspect-square w-full"
            >
              {/* Thin Teal Accent Line Along Top Edge */}
              <motion.div
                custom={index}
                variants={topBarVariants}
                animate="animate"
                className="absolute top-0 inset-x-0 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 group-hover:h-1.5 transition-all duration-300"
              />

              {/* Decorative Embedded Image in Bottom-Right Corner - Extra Large & Prominent */}
              <div className="absolute -bottom-1 -right-1 w-48 h-48 sm:w-52 sm:h-52 md:w-56 md:h-56 pointer-events-none select-none">
                {/* Curved Mint Background Shape Behind Image */}
                <div className="absolute inset-0 bg-gradient-to-tl from-teal-100/70 via-teal-50/40 to-transparent rounded-tl-[4.5rem] transform translate-x-2 translate-y-2 group-hover:scale-105 transition-transform duration-500" />
                
                {/* Visual Asset */}
                <motion.img
                  custom={index}
                  variants={imageAnimationVariants}
                  animate="animate"
                  src={dept.image}
                  alt={dept.title}
                  className="absolute bottom-0 right-0 w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52 object-contain object-bottom-right drop-shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1"
                />
              </div>

              {/* Top Row: Icon + Numbering + Tag + Title + Description */}
              <div className="relative z-10 flex flex-col">
                <div className="flex items-center justify-between mb-3.5 sm:mb-4">
                  {/* Clean Icon Container */}
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                    <div className="group-hover:[&_svg]:text-white transition-colors">
                      {dept.icon}
                    </div>
                  </div>

                  {/* Subtle Numbered Indicator */}
                  <span className="font-mono text-xs font-bold text-slate-300 tracking-wider group-hover:text-teal-600/70 transition-colors">
                    {dept.number}
                  </span>
                </div>

                {/* Tag */}
                <div className="mb-2">
                  <span className="inline-block text-[10px] font-semibold text-teal-800 bg-teal-50/90 px-2.5 py-0.5 rounded-full border border-teal-200/60 shadow-3xs">
                    {dept.tag}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-base sm:text-lg font-serif text-slate-900 mb-1.5 leading-snug font-bold group-hover:text-teal-700 transition-colors"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  {dept.title}
                </h3>

                {/* Description - constrained width so it never clashes with large bottom-right asset */}
                <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed max-w-[56%] sm:max-w-[58%] font-normal line-clamp-3">
                  {dept.description}
                </p>
              </div>

              {/* Bottom Row: Arrow Button on Left */}
              <div className="relative z-10 pt-2 mt-auto">
                <motion.div
                  custom={index}
                  variants={arrowVariants}
                  animate="animate"
                  className="w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 shadow-3xs group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600"
                >
                  <svg
                    className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default MedicalDepartments
