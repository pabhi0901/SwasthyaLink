import React from 'react'
import Navbar from '../../components/Navbar'
import Hero from '../../components/Hero'
import MedicalDepartments from '../../components/MedicalDepartments'
import PatientJourney from '../../components/PatientJourney'
import HomeServices from '../../components/HomeServices'
import HomeAppointments from '../../components/HomeAppointments'
import MainLayout from '../../components/MainLayout'
import AIAssistance from '../../components/AIAssistance'
import VideoReelSection from '../../components/VideoReelSection'

const CustomerHome = () => {
  return (
    <MainLayout navbar={Navbar}>
      <Hero />
      <MedicalDepartments />
      <PatientJourney />
      <HomeServices />
        <AIAssistance />
      <HomeAppointments />
      <VideoReelSection />
    
    </MainLayout>
  )
}

export default CustomerHome
