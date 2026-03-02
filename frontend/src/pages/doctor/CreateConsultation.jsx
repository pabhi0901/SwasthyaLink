import React, { useState } from 'react'
import axios from 'axios'

const CreateConsultation = () => {
  const [step, setStep] = useState(1) // 1: Form, 2: Review Slots
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    date: '',
    duration: '30',
    buffer: '5',
    startHour: '09',
    startMinute: '00',
    endHour: '17',
    endMinute: '00',
    category: 'general_physician',
    image: null
  })

  // Consultation and slots data
  const [consultation, setConsultation] = useState(null)
  const [slotsToRemove, setSlotsToRemove] = useState([]) // IDs of slots to remove

  const categories = [
    { value: 'general_physician', label: 'General Physician' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'gynecology', label: 'Gynecology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'ent', label: 'ENT' },
    { value: 'ophthalmology', label: 'Ophthalmology' },
    { value: 'dentistry', label: 'Dentistry' },
    { value: 'pulmonology', label: 'Pulmonology' },
    { value: 'endocrinology', label: 'Endocrinology' },
    { value: 'gastroenterology', label: 'Gastroenterology' },
    { value: 'urology', label: 'Urology' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB')
        return
      }
      setFormData(prev => ({ ...prev, image: file }))
      setError('')
    }
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const handleCreateConsultation = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key])
        }
      })

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/doctor/create-consultation`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.success) {
        setConsultation(response.data.consultation)
        setStep(2)
        setSuccess('Consultation created! Please review and confirm the time slots.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create consultation')
      console.error('Error creating consultation:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSlotRemoval = (slotId) => {
    setSlotsToRemove(prev => {
      if (prev.includes(slotId)) {
        return prev.filter(id => id !== slotId)
      } else {
        return [...prev, slotId]
      }
    })
  }

  const handleConfirmConsultation = async () => {
    if (!consultation) return
    
    setLoading(true)
    setError('')

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/doctor/confirm-consultation`,
        {
          consultationId: consultation._id,
          freeSlots: slotsToRemove
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        setSuccess('Consultation confirmed and activated successfully!')
        setTimeout(() => {
          // Reset form
          setStep(1)
          setFormData({
            name: '',
            description: '',
            price: '',
            date: '',
            duration: '30',
            buffer: '5',
            startHour: '09',
            startMinute: '00',
            endHour: '17',
            endMinute: '00',
            category: 'general_physician',
            image: null
          })
          setConsultation(null)
          setSlotsToRemove([])
          setSuccess('')
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm consultation')
      console.error('Error confirming consultation:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToEdit = () => {
    setStep(1)
    setConsultation(null)
    setSlotsToRemove([])
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Create Consultation</h2>
        <p className="text-gray-600 mt-2">
          {step === 1 ? 'Fill in the consultation details' : 'Review and confirm time slots'}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 1 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {step === 1 ? '1' : '✓'}
            </div>
            <div className="w-32 h-1 bg-gray-300 mx-2">
              <div className={`h-full bg-blue-600 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>
        <div className="flex justify-between max-w-sm mx-auto mt-2">
          <span className="text-sm font-medium">Details</span>
          <span className="text-sm font-medium">Review Slots</span>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Step 1: Consultation Form */}
      {step === 1 && (
        <form onSubmit={handleCreateConsultation} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consultation Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                minLength={3}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., General Health Checkup"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                minLength={10}
                maxLength={500}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the consultation service..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.image && (
                <p className="text-sm text-gray-600 mt-1">Selected: {formData.image.name}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration per Slot (minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                min="1"
                max="240"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30"
              />
            </div>

            {/* Buffer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buffer Time (minutes)
              </label>
              <input
                type="number"
                name="buffer"
                value={formData.buffer}
                onChange={handleInputChange}
                min="0"
                max="60"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="startHour"
                  value={formData.startHour}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="23"
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="HH"
                />
                <input
                  type="number"
                  name="startMinute"
                  value={formData.startMinute}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="59"
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="MM"
                />
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="endHour"
                  value={formData.endHour}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="23"
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="HH"
                />
                <input
                  type="number"
                  name="endMinute"
                  value={formData.endMinute}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="59"
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="MM"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Consultation'}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Review and Confirm Slots */}
      {step === 2 && consultation && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Generated Time Slots
            </h3>
            <p className="text-gray-600">
              Click on slots you want to <span className="font-semibold text-red-600">remove</span>. 
              Remaining slots will be available for booking.
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Slots:</span> {consultation.slots.length}
              </div>
              <div>
                <span className="font-medium">Slots to Remove:</span> {slotsToRemove.length}
              </div>
              <div>
                <span className="font-medium">Final Slots:</span> {consultation.slots.length - slotsToRemove.length}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {consultation.duration} min
              </div>
            </div>
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            {consultation.slots.map((slot, index) => {
              const isMarkedForRemoval = slotsToRemove.includes(slot._id)
              return (
                <button
                  key={slot._id}
                  type="button"
                  onClick={() => toggleSlotRemoval(slot._id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                    isMarkedForRemoval
                      ? 'border-red-500 bg-red-50 text-red-700 line-through'
                      : 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <div className="font-medium text-sm">
                    {formatTime(slot.startMinute)} - {formatTime(slot.endMinute)}
                  </div>
                  <div className="text-xs mt-1">
                    {isMarkedForRemoval ? 'Will Remove' : 'Available'}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              type="button"
              onClick={handleBackToEdit}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              ← Back to Edit
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSlotsToRemove([])}
                disabled={slotsToRemove.length === 0}
                className="px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reset Selection
              </button>
              
              <button
                type="button"
                onClick={handleConfirmConsultation}
                disabled={loading || consultation.slots.length - slotsToRemove.length === 0}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Confirming...' : 'Confirm Consultation'}
              </button>
            </div>
          </div>

          {consultation.slots.length - slotsToRemove.length === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm text-center">
                ⚠️ You must keep at least one slot available for booking
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreateConsultation
