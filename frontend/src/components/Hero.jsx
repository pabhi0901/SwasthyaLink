import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'

const Hero = () => {
  const navigate = useNavigate()

  // 5 Doctor showcase images provided by the user
  const doctorSlides = [
    {
      url: 'https://ik.imagekit.io/g6obyrspb/doctor.png',
      alt: 'Doctor Consultation & Checkup',
    },
    {
      url: 'https://ik.imagekit.io/g6obyrspb/doctor2.png',
      alt: 'Clinical Medical Consultation',
    },
    {
      url: 'https://ik.imagekit.io/g6obyrspb/dt3.png',
      alt: 'Diagnostic Health Examination',
    },
    {
      url: 'https://ik.imagekit.io/g6obyrspb/dt4.png',
      alt: 'Family Health & Primary Care',
    },
    {
      url: 'https://ik.imagekit.io/g6obyrspb/DT5.png',
      alt: 'Online Telehealth & Specialist Link',
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1: next, -1: prev
  const [isPaused, setIsPaused] = useState(false)

  // 3D Parallax Mouse Tilt values
  const cardRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth springs for buttery tilt motion
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 220,
    damping: 24,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 220,
    damping: 24,
  })

  // Dynamic glare position
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']), {
    stiffness: 200,
    damping: 25,
  })
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']), {
    stiffness: 200,
    damping: 25,
  })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsPaused(false)
  }

  // Auto-advance cards every 4.8 seconds
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % doctorSlides.length)
    }, 4800)
    return () => clearInterval(interval)
  }, [isPaused, doctorSlides.length])

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const prevSlide = (e) => {
    e?.stopPropagation?.()
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + doctorSlides.length) % doctorSlides.length)
  }

  const nextSlide = (e) => {
    e?.stopPropagation?.()
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % doctorSlides.length)
  }

  // Handle tactile drag end (swipe gesture)
  const handleDragEnd = (_, info) => {
    const swipeThreshold = 45
    if (info.offset.x < -swipeThreshold) {
      nextSlide()
    } else if (info.offset.x > swipeThreshold) {
      prevSlide()
    }
  }

  // Upcoming stacked card preview in 3D deck behind current card
  const nextPreviewIndex = (currentIndex + 1) % doctorSlides.length

  // Ultra-smooth 3D Spatial Flip Variants
  const cardVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 55 : -55,
      scale: 0.94,
      rotateY: dir > 0 ? 10 : -10,
      opacity: 0,
      filter: 'blur(6px)',
    }),
    center: {
      x: 0,
      scale: 1,
      rotateY: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 26 },
        scale: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        rotateY: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.45 },
        filter: { duration: 0.35 },
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? -55 : 55,
      scale: 0.92,
      rotateY: dir > 0 ? -10 : 10,
      opacity: 0,
      filter: 'blur(6px)',
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 26 },
        scale: { duration: 0.45 },
        rotateY: { duration: 0.45 },
        opacity: { duration: 0.4 },
        filter: { duration: 0.3 },
      },
    }),
  }

  // Avatars for social proof
  const avatars = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
  ]

  return (
    <section className="relative overflow-hidden pt-6 pb-20 lg:pt-10 lg:pb-28 flex items-center min-h-[calc(100vh-5.5rem)] bg-white">
      {/* ================= SUBTLE, LOW-OPACITY BACKGROUND DECORATIONS ================= */}

      {/* 1. Ambient Glows (Luminous White/Mint) */}
      <div className="absolute top-0 left-10 w-[520px] h-[520px] bg-gradient-to-br from-teal-50/70 via-emerald-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-0 w-[620px] h-[620px] bg-gradient-to-bl from-teal-50/60 via-cyan-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 2. Low-Opacity Medical Plus Symbols (~15-20%) */}
      <div className="absolute top-10 left-10 lg:left-28 text-teal-300/25 select-none pointer-events-none transform -rotate-12">
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6h6a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-6v6a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-6H3a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h6V3z" />
        </svg>
      </div>

      <div className="absolute top-14 left-[44%] text-teal-200/30 select-none pointer-events-none transform rotate-12 hidden md:block">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6h6a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-6v6a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-6H3a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h6V3z" />
        </svg>
      </div>

      <div className="absolute bottom-20 right-[18%] text-teal-200/25 select-none pointer-events-none hidden lg:block">
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6h6a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-6v6a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-6H3a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h6V3z" />
        </svg>
      </div>

      {/* 3. Faint Dot Matrix Patterns */}
      <div className="absolute top-8 left-[50%] grid grid-cols-6 gap-2.5 opacity-20 pointer-events-none select-none hidden md:grid">
        {[...Array(18)].map((_, i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-teal-600"></span>
        ))}
      </div>

      <div className="absolute top-6 right-12 lg:right-24 grid grid-cols-5 gap-2.5 opacity-20 pointer-events-none select-none hidden sm:grid">
        {[...Array(20)].map((_, i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-teal-600"></span>
        ))}
      </div>

      {/* 4. Subtle ECG Pulse Waveform in Central Negative Space */}
      <div className="absolute top-[48%] left-[45%] w-72 pointer-events-none select-none opacity-25 z-0 hidden lg:block">
        <svg viewBox="0 0 300 80" fill="none" className="w-full h-12 text-teal-400 stroke-current">
          <path
            d="M0 40 H 80 L 95 10 L 110 70 L 125 25 L 135 50 L 145 40 H 300"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 5. Minimal Leaf Shape Accent (Bottom Left) */}
      <div className="absolute -bottom-8 -left-8 w-36 h-36 pointer-events-none select-none opacity-25 text-teal-400">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M10 90 C 25 70, 35 45, 60 30 C 50 45, 45 60, 40 85 Z" opacity="0.6" />
          <path d="M10 90 C 35 80, 55 70, 75 55 C 60 65, 45 75, 25 88 Z" opacity="0.8" />
          <path d="M10 90 C 15 65, 20 40, 40 20 C 35 40, 25 65, 15 85 Z" opacity="0.5" />
        </svg>
      </div>

      {/* 6. Organic Soft Wave at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none select-none z-0">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-14 sm:h-20 object-cover"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50 C 320 90, 640 10, 960 45 C 1200 70, 1360 25, 1440 35 L 1440 100 L 0 100 Z"
            fill="#e0f4ef"
            fillOpacity="0.3"
          />
          <path
            d="M0 65 C 360 30, 720 85, 1080 50 C 1280 25, 1380 55, 1440 65 L 1440 100 L 0 100 Z"
            fill="#edf8f5"
            fillOpacity="0.5"
          />
        </svg>
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* LEFT COLUMN: HERO HEADLINE, DESCRIPTION, CTA BUTTONS (Columns 1-6) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7">
            
            {/* Pill Badge */}
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50/90 border border-teal-200/60 shadow-2xs">
                <svg
                  className="w-3.5 h-3.5 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <span className="text-[11px] font-bold text-teal-800 tracking-wider uppercase">
                  Next-Gen Healthcare
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.12]">
                <span className="text-slate-900 block">Care That</span>
                <span className="text-teal-600 block mt-1">Comes to You.</span>
              </h1>
            </div>

            {/* Description Text */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg font-normal">
              Home services. Online & offline consultations. AI-powered medical
              assistance tailored for your family's unique health needs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => navigate('/appointments')}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-teal-600/20 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-98"
              >
                <span>Book Appointment</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => navigate('/services')}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 hover:border-teal-300 shadow-2xs flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-98"
              >
                <span>Explore Services</span>
                <svg
                  className="w-4 h-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2.5">
                {avatars.map((avatar, index) => (
                  <div
                    key={index}
                    className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-2xs ring-1 ring-slate-100"
                  >
                    <img
                      src={avatar}
                      alt={`Patient ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                <span className="font-bold text-slate-900">Trusted by 10k+</span>{' '}
                patients globally
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: CLEAN 3D PARALLAX SHOWCASE WITH TACTILE SWIPE & PRESERVED 24/7 SUPPORT */}
          <div className="lg:col-span-6 relative flex items-center justify-center pt-2 lg:pt-0">
            <div
              ref={cardRef}
              className="relative w-full max-w-lg lg:max-w-none group select-none"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={handleMouseLeave}
              style={{ perspective: 1400 }}
            >
              
              {/* Layer 0: Soft Ambient Mint Background Halo */}
              <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-tr from-teal-200/50 via-teal-100/35 to-cyan-100/45 rounded-[2.5rem] -rotate-2 transform scale-102 blur-[1px]"></div>

              {/* 3D Tilting Stage Wrapper */}
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d',
                }}
                className="relative w-full aspect-[16/10]"
              >
                
                {/* Layer 1: Stacked Depth Card Preview Peeking Behind */}
                <div
                  onClick={() => nextSlide()}
                  className="absolute inset-0 rounded-3xl overflow-hidden shadow-lg border-2 border-white/80 bg-slate-100 aspect-[16/10] transform scale-[0.955] translate-x-2.5 -translate-y-1.5 rotate-[1.5deg] opacity-40 filter blur-[0.6px] pointer-events-auto cursor-pointer transition-all duration-700 hover:opacity-60"
                  style={{ transform: 'translateZ(-20px) scale(0.955) translateX(10px) translateY(-6px) rotate(1.5deg)' }}
                  title="Click to switch specialist"
                >
                  <img
                    src={doctorSlides[nextPreviewIndex].url}
                    alt="Next Specialist"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Layer 2: Main Active Interactive Front Card (Clean - No Cluttered Text Overlays) */}
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  style={{ transformStyle: 'preserve-3d', transform: 'translateZ(15px)' }}
                  className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/95 bg-white cursor-grab active:cursor-grabbing"
                >
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={currentIndex}
                      custom={direction}
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute inset-0 w-full h-full"
                    >
                      {/* Slow Cinematic Ken-Burns Ambient Scale */}
                      <motion.img
                        src={doctorSlides[currentIndex].url}
                        alt={doctorSlides[currentIndex].alt}
                        initial={{ scale: 1.07 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 4.8, ease: 'easeOut' }}
                        className="w-full h-full object-cover object-center select-none pointer-events-none"
                      />

                      {/* Light Sheen Reflection that moves with cursor */}
                      <motion.div
                        style={{
                          background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 65%)`,
                        }}
                        className="absolute inset-0 pointer-events-none"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Left & Right Glass Navigation Chevrons (Hover to reveal) */}
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous Image"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next Image"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* 5-Pill Progress Indicators (Bottom-Right Inside Card) */}
                  <div className="absolute bottom-3 right-3.5 z-20 flex items-center gap-1.5 bg-black/35 backdrop-blur-md px-2.5 py-1.5 rounded-full">
                    {doctorSlides.map((_, idx) => {
                      const isActive = idx === currentIndex
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            goToSlide(idx)
                          }}
                          aria-label={`Show image ${idx + 1}`}
                          className={`relative rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                            isActive ? 'w-6 h-1.5 bg-white/35' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/90'
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              key={`progress-bar-${currentIndex}`}
                              initial={{ width: '0%' }}
                              animate={{ width: isPaused ? '100%' : '100%' }}
                              transition={{
                                duration: isPaused ? 0 : 4.8,
                                ease: 'linear',
                              }}
                              className="absolute inset-0 bg-teal-400 rounded-full"
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              </motion.div>

              {/* Existing "24/7 Support" Card (Attached/Overlapping bottom-left of image) */}
              <div className="absolute -bottom-5 sm:-bottom-6 left-4 sm:left-8 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl border border-slate-100/90 flex items-center gap-3 z-30 pointer-events-auto select-none">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-xs sm:text-sm leading-tight">
                    24/7 Support
                  </p>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    AI & Human Expert assistance
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Hero
