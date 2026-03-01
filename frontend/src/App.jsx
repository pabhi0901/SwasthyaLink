import React from 'react'
import { Routes, Route } from 'react-router-dom'
import CustomerHome from './pages/customer/CustomerHome'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import NurseDashboard from './pages/nurse/NurseDashboard'
import CashierDashboard from './pages/cashier/CashierDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import Profile from './pages/Profile'
import Appointments from './pages/Appointments'
import Services from './pages/Services'
import MyBookings from './pages/MyBookings'
import ServiceDetail from './pages/ServiceDetail'
import ConfirmedBooking from './pages/ConfirmedBooking'
import ConsultationDetail from './pages/customer/ConsultationDetail'
import ConfirmedAppointment from './pages/customer/ConfirmedAppointment'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CustomerHome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/services" element={<Services />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/service/:serviceId" element={<ServiceDetail />} />
        <Route path="/confirmed-booking/:bookingId" element={<ConfirmedBooking />} />
        <Route path="/consultation/:consultationId" element={<ConsultationDetail />} />
        <Route path="/confirmed-appointment/:appointmentId" element={<ConfirmedAppointment />} />
        
        {/* Protected Routes - Doctor */}
        <Route path="/doctor/*" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes - Nurse */}
        <Route path="/nurse/*" element={
          <ProtectedRoute allowedRoles={['nurse']}>
            <NurseDashboard />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes - Cashier */}
        <Route path="/cashier/*" element={
          <ProtectedRoute allowedRoles={['cashier', 'admin']}>
            <CashierDashboard />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes - Admin */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App
