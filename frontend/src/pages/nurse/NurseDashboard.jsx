import React, { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import NurseNavbar from '../../components/NurseNavbar'
import ConfirmedOrders from './ConfirmedOrders'
import CompletedOrders from './CompletedOrders'
import BookingDetail from './BookingDetail'
import ApplyLeave from './ApplyLeave'

const NurseDashboard = () => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebarLinks = [
    { name: 'Confirmed Orders', path: '/nurse', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )},
    { name: 'Completed Orders', path: '/nurse/completed-orders', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )},
    { name: 'Apply for Leave', path: '/nurse/apply-leave', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )}
  ]

  const isActive = (path) => {
    if (path === '/nurse') return location.pathname === '/nurse'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="h-screen flex flex-col">
      <NurseNavbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 left-4 z-40 bg-teal-600 text-white p-3 rounded-full shadow-lg hover:bg-teal-700 transition-colors"
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
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-56 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:mt-0 mt-0
        `}>
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={isActive(link.path) ? 'text-teal-600' : 'text-gray-500'}>
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
            <Route path="/" element={<ConfirmedOrders />} />
            <Route path="/booking/:bookingId" element={<BookingDetail />} />
            <Route path="/completed-orders" element={<CompletedOrders />} />
            <Route path="/apply-leave" element={<ApplyLeave />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default NurseDashboard
