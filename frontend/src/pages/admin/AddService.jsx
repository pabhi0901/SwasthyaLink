import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FaArrowLeft, FaCloudUploadAlt } from 'react-icons/fa'
import axios from 'axios'

const AddService = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState([])

  const [serviceData, setServiceData] = useState({
    name: '',
    description: '',
    category: '',
    sessionDuration: '',
    price: ''
  })

  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'nursing', label: 'Nursing' },
    { value: 'elder-care', label: 'Elder Care' },
    { value: 'post-surgery-care', label: 'Post-Surgery Care' },
    { value: 'physiotherapy', label: 'Physiotherapy' },
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'home-visit-doctor', label: 'Home Visit Doctor' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'palliative-care', label: 'Palliative Care' },
    { value: 'medical-equipment-rental', label: 'Medical Equipment Rental' },
    { value: 'icu-at-home', label: 'ICU at Home' },
    { value: 'mother-and-baby-care', label: 'Mother and Baby Care' },
    { value: 'massage-therapy', label: 'Massage Therapy' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setServiceData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed')
      return
    }
    setImages(prev => [...prev, ...files].slice(0, 5))
    setError('')
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!serviceData.name.trim()) {
      setError('Service name is required')
      return
    }
    if (serviceData.name.length < 3 || serviceData.name.length > 100) {
      setError('Service name must be between 3-100 characters')
      return
    }
    if (!serviceData.category) {
      setError('Category is required')
      return
    }
    if (!serviceData.price || parseFloat(serviceData.price) <= 0) {
      setError('Valid price is required')
      return
    }
    if (serviceData.sessionDuration && (parseInt(serviceData.sessionDuration) < 15 || parseInt(serviceData.sessionDuration) > 720)) {
      setError('Session duration must be between 15 and 720 minutes')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', serviceData.name)
      formData.append('description', serviceData.description)
      formData.append('category', serviceData.category)
      if (serviceData.sessionDuration) {
        formData.append('sessionDuration', serviceData.sessionDuration)
      }
      formData.append('price', serviceData.price)

      // Append images
      images.forEach((image) => {
        formData.append('images', image)
      })

      const response = await axios.post(
        'http://localhost:5003/api/services/createService',
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.success) {
        alert('Service created successfully!')
        navigate('/admin')
      }
    } catch (err) {
      console.error('Service creation error:', err)
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Left Side - Image and Content */}
      <div className="hidden lg:flex lg:w-1/2 p-8 flex-col justify-start gap-6" style={{ backgroundColor: '#eef3f2' }}>
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            <FaArrowLeft />
            <span>Back to Admin Panel</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="p-6">
            <div className="relative w-120 h-75 rounded-xl overflow-hidden mb-4">
              <img
                src="https://media.istockphoto.com/id/530917316/photo/young-woman-enjoying-in-a-neck-massage-at-the-spa.jpg?s=612x612&w=0&k=20&c=KlfaKSZ_KYsAbsNyjs9SUjJBanHTIbLlKF6-ipkzyEA="
                alt="Healthcare Service"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-teal-600 text-xs font-medium tracking-wider mb-3">
              SERVICE REGISTRATION PORTAL
            </p>
            <h2 className="text-2xl font-bold text-dark-900 mb-1">
              Expanding Care Services.
            </h2>
            <h2 className="text-2xl font-bold text-dark-900 mb-4">
              One Service at a Time.
            </h2>
            <p className="text-dark-600 text-sm leading-relaxed">
              Add new clinical or wellness services to broaden your healthcare offerings and better serve your patients.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-dark-700 text-xs mt-auto">
          © 2026 SwashtyaLink Healthcare
        </div>
      </div>

      {/* Right Side - Service Form */}
      <div className="w-full lg:w-1/2 flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Form Content - Scrollable */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          <div className="max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-teal-600">SwashtyaLink</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-6">
              <p className="text-teal-600 text-xs font-semibold uppercase tracking-wider mb-2" style={{ letterSpacing: '0.1em' }}>
                Service Registration
              </p>
              <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontWeight: 700, lineHeight: 1.2 }}>
                Add New Service
              </h1>
              <p className="text-gray-600 text-sm" style={{ fontWeight: 400 }}>
                Initialize new clinical or hospitality service modules.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm" style={{ fontWeight: 500 }}>{error}</p>
              </div>
            )}

            {/* Service Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={serviceData.name}
                  onChange={handleInputChange}
                  placeholder="Enter service name"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  style={{ fontSize: '15px', fontWeight: 400 }}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={serviceData.description}
                  onChange={handleInputChange}
                  placeholder="Enter service description (optional)"
                  rows="3"
                  maxLength="1000"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  style={{ fontSize: '15px', fontWeight: 400 }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={serviceData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={serviceData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Session Duration (minutes)
                </label>
                <input
                  type="number"
                  name="sessionDuration"
                  value={serviceData.sessionDuration}
                  onChange={handleInputChange}
                  placeholder="e.g., 60 (optional, 15-720 mins)"
                  min="15"
                  max="720"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  style={{ fontSize: '15px', fontWeight: 400 }}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Service Images (Max 5)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="cursor-pointer">
                    <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 mb-2" />
                    <p className="text-gray-600 text-sm" style={{ fontWeight: 500 }}>
                      Click to upload images
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      PNG, JPG up to 5 images
                    </p>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '15px', fontWeight: 600 }}
              >
                {loading ? 'Creating Service...' : 'Create Service'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="w-full py-1.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Cancel
              </button>
            </form>

            {/* Info Note */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-center text-gray-500 flex items-center justify-center gap-2" style={{ fontSize: '12px' }}>
                <span>ℹ️</span>
                <span>Fields marked with * are required</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddService
