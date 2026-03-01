import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminNavbar from '../../components/AdminNavbar'
import AdminGateway from './AdminGateway'
import ManageDoctors from './ManageDoctors'
import ManageNurses from './ManageNurses'
import ManageServices from './ManageServices'
import PatientRecords from './PatientRecords'
import RegisterDoctor from './RegisterDoctor'
import RegisterNurse from './RegisterNurse'
import AddService from './AddService'
import MainLayout from '../../components/MainLayout'

const AdminDashboard = () => {
  return (
    <MainLayout navbar={AdminNavbar}>
      <Routes>
        <Route path="/" element={<AdminGateway />} />
        <Route path="/manage-doctors" element={<ManageDoctors />} />
        <Route path="/manage-nurses" element={<ManageNurses />} />
        <Route path="/manage-services" element={<ManageServices />} />
        <Route path="/patient-records" element={<PatientRecords />} />
        <Route path="/register-doctor" element={<RegisterDoctor />} />
        <Route path="/register-nurse" element={<RegisterNurse />} />
        <Route path="/add-service" element={<AddService />} />
      </Routes>
    </MainLayout>
  )
}

export default AdminDashboard
