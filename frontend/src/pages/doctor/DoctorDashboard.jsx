import React, { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import DoctorNavbar from '../../components/DoctorNavbar'
import CreateConsultation from './CreateConsultation'
import ActiveConsultations from './ActiveConsultations'
import AllConsultations from './AllConsultations'
import ConsultationDetails from './ConsultationDetails'
import AppointmentDetail from './AppointmentDetail'
import InactiveConsultationDetails from './InactiveConsultationDetails'

const DoctorDashboard = () => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebarLinks = [
    {
      name: 'Create Consultation',
      path: '/doctor',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      name: 'Active Consultations',
      path: '/doctor/active-consultations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'All Consultations',
      path: '/doctor/all-consultations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    }
  ]

  const isActive = (path) => {
    if (path === '/doctor') return location.pathname === '/doctor'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="h-screen flex flex-col">
      <DoctorNavbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 left-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-56 bg-white border-r border-gray-200 shrink-0 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:mt-0 mt-0
        `}
        >
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={isActive(link.path) ? 'text-blue-600' : 'text-gray-500'}>
                  {link.icon}
                </span>
                {link.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Routes>
            <Route path="/" element={<CreateConsultation />} />
            <Route path="/active-consultations" element={<ActiveConsultations />} />
            <Route path="/inactive-consultation/:id" element={<InactiveConsultationDetails />} />
            <Route path="/consultation/:consultationId" element={<ConsultationDetails />} />
            <Route path="/appointment/:appointmentId" element={<AppointmentDetail />} />
            <Route path="/all-consultations" element={<AllConsultations />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default DoctorDashboard