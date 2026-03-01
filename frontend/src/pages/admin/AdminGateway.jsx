import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUserMd, FaUserNurse, FaChevronRight } from 'react-icons/fa'
import { MdLocalHospital } from 'react-icons/md'
import { FaUsers } from 'react-icons/fa'

const AdminGateway = () => {
  const navigate = useNavigate()

  const coreManagementCards = [
    {
      id: 1,
      title: 'Manage Doctors',
      description: 'View rosters, schedules, and active duty assignments',
      icon: <FaUserMd className="text-xl text-teal-600" />,
      route: '/admin/manage-doctors',
      iconBg: 'bg-teal-100'
    },
    {
      id: 2,
      title: 'Manage Nurses',
      description: 'Departmental allocation and shift management',
      icon: <FaUserNurse className="text-xl text-teal-600" />,
      route: '/admin/manage-nurses',
      iconBg: 'bg-teal-100'
    },
    {
      id: 3,
      title: 'Manage Services',
      description: 'Configuration of OPD, ER, and Diagnostic offerings',
      icon: <MdLocalHospital className="text-xl text-teal-600" />,
      route: '/admin/manage-services',
      iconBg: 'bg-teal-100'
    },
    {
      id: 4,
      title: 'Patient Records',
      description: 'Database oversight and digital health records access',
      icon: <FaUsers className="text-xl text-teal-600" />,
      route: '/admin/patient-records',
      iconBg: 'bg-teal-100'
    }
  ]

  const registrationCards = [
    {
      id: 5,
      title: 'Register New Doctor',
      description: 'Add medical professional credentials',
      icon: <FaUserMd className="text-xl text-red-400" />,
      route: '/admin/register-doctor',
      iconBg: 'bg-red-50'
    },
    {
      id: 6,
      title: 'Register New Nurse',
      description: 'Onboard nursing and support staff',
      icon: <FaUserNurse className="text-xl text-red-400" />,
      route: '/admin/register-nurse',
      iconBg: 'bg-red-50'
    },
    {
      id: 7,
      title: 'Add New Service',
      description: 'Register new medical service or facility',
      icon: <MdLocalHospital className="text-xl text-red-400" />,
      route: '/admin/add-service',
      iconBg: 'bg-red-50'
    }
  ]

  const handleCardClick = (route) => {
    if (route) {
      navigate(route)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Manrope, serif', fontWeight: 700 }}>
            Management Gateway
          </h1>
          <p className="text-gray-600 text-base">
            Select a category to manage hospital operations or register new institutional resources.
          </p>
        </div>

        {/* Core Management Section */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-6">
            Departmental Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreManagementCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.route)}
                className="bg-white rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-xl border-l-4 border-teal-500 shadow-sm group flex items-center gap-4"
              >
                <div className={`${card.iconBg} w-14 h-14 rounded-lg flex items-center justify-center shrink-0`}>
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {card.description}
                  </p>
                </div>
                <FaChevronRight className="text-gray-400 text-sm shrink-0 group-hover:text-teal-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Registration & Creation Section */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Registration & Infrastructure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {registrationCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.route)}
                className="bg-white rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-xl shadow-sm group"
              >
                <div className={`${card.iconBg} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                  {card.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 mt-12">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold">SERVER STATUS:</span>
              <span className="text-teal-600 font-semibold">OPERATIONAL</span>
            </div>
            <span className="font-semibold">LOGGED IN FROM: 192.168.1.105 (SECURE)</span>
            <span>Terms of Service</span>
            <span>Privacy Protocol</span>
            <span>© 2026 SwasthyaLink Institutional</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminGateway
