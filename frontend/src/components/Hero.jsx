import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import ImageCarousel from './ImageCarousel'

const Hero = () => {
  const navigate = useNavigate()

  // Healthcare images - can add more later
  const carouselImages = [
    'https://ik.imagekit.io/cdsjgzx6p/swasthyalink_extras/dab93888-410d-401a-9187-4b175c194484.jpg',
    'https://ik.imagekit.io/cdsjgzx6p/swasthyalink_extras/ce584d9e-9551-463b-b6c3-5106303fda8c.jpg?updatedAt=1772030820941',
  ]

  // Placeholder avatar images for trust indicator
  const avatars = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
  ]

  return (
    <section className="px-4 sm:px-6 lg:px-8 flex items-center" style={{ height: 'calc(100vh - 5rem)' }}>
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          {/* Left Content */}
          <div className="space-y-4 md:space-y-6">
            {/* Badge */}
            <div className="inline-block">
              <span className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                Next-Gen Healthcare
              </span>
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                <span className="text-dark-900">Care That</span>
                <br />
                <span className="text-primary-400">Comes to You.</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-sm md:text-base text-dark-600 leading-relaxed max-w-xl">
              Home services. Online & offline consultations. AI-powered medical assistance tailored for your family's unique health needs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="primary" 
                size="md"
                onClick={() => navigate('/appointments')}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              >
                Book Appointment
              </Button>
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => navigate('/services')}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }
              >
                Explore Services
              </Button>
            </div>

            {/* Trust Indicator */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {avatars.map((avatar, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white overflow-hidden shadow-md"
                  >
                    <img
                      src={avatar}
                      alt={`Patient ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs md:text-sm text-dark-600">
                  <span className="font-semibold text-dark-800">Trusted by 10k+</span> patients globally
                </p>
              </div>
            </div>
          </div>

          {/* Right Image Carousel */}
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-120">
            <div className="absolute inset-0 bg-linear-to-br from-primary-100 to-primary-50 rounded-3xl -rotate-3"></div>
            <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl">
              <ImageCarousel images={carouselImages} interval={3000} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
