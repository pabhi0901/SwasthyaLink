import React from 'react'
import { FiSliders } from 'react-icons/fi'

const ServicePlaceholderPanel = ({ label }) => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-12 py-16 text-center text-gray-500 space-y-3">
      <FiSliders className="w-8 h-8 mx-auto text-gray-400" />
      <p className="text-base font-semibold">{label} view coming soon</p>
      <p className="text-sm">
        This section is being designed. Meanwhile, continue using the Service Catalog and Detail panels.
      </p>
    </div>
  </div>
)

export default ServicePlaceholderPanel
