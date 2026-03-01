import React from 'react'

const PlaceholderPanel = ({ label }) => (
  <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
    <h2 className="text-xl font-semibold text-gray-900 mb-2">{label}</h2>
    <p className="text-sm text-gray-500">This module will be configured soon.</p>
  </div>
)

export default PlaceholderPanel
