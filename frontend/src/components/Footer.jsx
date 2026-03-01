import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#0a4a4a' }}>
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1 — Brand */}
          <div className="lg:pr-6">
            <div className="flex items-center gap-3 mb-5">
              {/* Briefcase icon */}
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <span
                className="text-white text-base font-bold tracking-widest uppercase"
                style={{ letterSpacing: '0.18em' }}
              >
                SwashtyaLink
              </span>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              The pinnacle of personalized healthcare. We redefine the patient journey through clinical excellence, advanced technology, and unwavering dedication to wellness.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-7">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/__abhishekpandey_/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:border-white"
                style={{ borderColor: 'rgba(255,255,255,0.35)', color: 'rgba(255,255,255,0.7)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/abhishek-pandey-45b215296/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:border-white"
                style={{ borderColor: 'rgba(255,255,255,0.35)', color: 'rgba(255,255,255,0.7)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/pabhi0901"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:border-white"
                style={{ borderColor: 'rgba(255,255,255,0.35)', color: 'rgba(255,255,255,0.7)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 — Departments */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-6"
              style={{ color: '#c8a96e', letterSpacing: '0.15em' }}
            >
              Departments
            </h4>
            <ul className="space-y-3">
              {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Surgery'].map((dept) => (
                <li key={dept}>
                  <Link
                    to="/appointments"
                    className="text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.72)' }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.72)'}
                  >
                    {dept}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Patient Care */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-6"
              style={{ color: '#c8a96e', letterSpacing: '0.15em' }}
            >
              Patient Care
            </h4>
            <ul className="space-y-3">
              {['Emergency Services', 'Home Healthcare', 'Laboratory Tests', 'Telemedicine', 'Wellness Packages'].map((item) => (
                <li key={item}>
                  <Link
                    to="/services"
                    className="text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.72)' }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.72)'}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Headquarters */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-6"
              style={{ color: '#c8a96e', letterSpacing: '0.15em' }}
            >
              Headquarters
            </h4>
            <ul className="space-y-4">
              {/* Address */}
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#c8a96e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  Developed by Abhishek Pandey
                </span>
              </li>

              {/* Phone */}
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 shrink-0" style={{ color: '#c8a96e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a
                  href="tel:+918340195034"
                  className="text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.72)' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.72)'}
                >
                  +91 83401 95034
                </a>
              </li>

              {/* Email */}
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 shrink-0" style={{ color: '#c8a96e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:pabhishek7333@gmail.com"
                  className="text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.72)' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.72)'}
                >
                  pabhishek7333@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t px-6 lg:px-10 py-5"
        style={{ borderColor: 'rgba(255,255,255,0.12)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-xs uppercase tracking-widest order-2 sm:order-1" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
            © 2026 SwashtyaLink Medical Corporation. All rights reserved.
          </p>

          {/* Gold decorative line */}
          <div className="w-16 h-px order-1 sm:order-2" style={{ backgroundColor: '#c8a96e' }} />

          {/* Links */}
          <div className="flex items-center gap-5 order-3">
            {['Privacy Policy', 'Terms of Service', 'Ethics & Conduct'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs uppercase tracking-widest transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}
                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.75)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
