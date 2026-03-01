import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import MedicalDepartments from '../components/MedicalDepartments'
import PatientJourney from '../components/PatientJourney'
import HomeServices from '../components/HomeServices'
import HomeAppointments from '../components/HomeAppointments'
import AIAssistance from '../components/AIAssistance'
import VideoReelSection from '../components/VideoReelSection'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <MedicalDepartments />
      <PatientJourney />
      <HomeServices />
       <AIAssistance />
      <HomeAppointments />
      <VideoReelSection />
    
    </div>
  )
}

export default Home
